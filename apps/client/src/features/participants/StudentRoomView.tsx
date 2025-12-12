import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { leaveRoomAsParticipant } from "@/modules/participants/participants.service";
import { useParticipantSession } from "@/modules/participants/useParticipantSession";

export default function StudentRoomView() {
	const navigate = useNavigate();
	const { roomId: roomIdParam } = useParams<{ roomId: string }>();

	const session = useParticipantSession();

	// Until game state exists in API/ws, we keep these as placeholders
	const [answerText, setAnswerText] = useState("");
	const [submittingAnswer, setSubmittingAnswer] = useState(false);

	// Basic guards
	const effectiveRoomId = session?.roomId ?? roomIdParam ?? "------";
	const playerName = session?.nickname ?? "Participant";

	const mismatchRoom = useMemo(() => {
		if (!session?.roomId || !roomIdParam) return false;
		return session.roomId !== roomIdParam;
	}, [session?.roomId, roomIdParam]);

	const expiresLabel = useMemo(() => {
		if (!session?.expiresAt) return null;
		const d = new Date(session.expiresAt);
		if (Number.isNaN(d.getTime())) return null;
		return d.toLocaleString();
	}, [session?.expiresAt]);

	const onBackToJoin = () => navigate("/", { replace: true });

	const onLeaveRoom = async () => {
		try {
			await leaveRoomAsParticipant(); // should clear token + session
		} finally {
			navigate("/", { replace: true });
		}
	};

	// Placeholder states (disable until you add sockets / endpoints)
	const canBuzz = false;
	const canAnswer = false;
	const timerLabel = "Waiting for host to start the game...";
	const phaseLabel = "Waiting";
	const phaseDotClass = "bg-slate-500";

	const helperText = mismatchRoom
		? "This room doesn't match your current session. Please re-join."
		: "You're connected. Waiting for the host to start the next question.";

	const onBuzz = () => {
		// TODO: websocket emit: participant:buzz
	};

	const onSubmitAnswer = async () => {
		if (!canAnswer || !answerText.trim()) return;

		setSubmittingAnswer(true);
		try {
			// TODO: websocket emit: participant:answer
			setAnswerText("");
		} finally {
			setSubmittingAnswer(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6">
			<div className="mx-auto w-full max-w-6xl space-y-4">
				{/* Header */}
				<header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2">
							<p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
								Quiz Room
							</p>
							<p className="font-mono text-sm text-sky-400">
								#{effectiveRoomId}
							</p>
						</div>

						<div>
							<p className="text-xs text-slate-400">Player</p>
							<p className="text-sm font-semibold text-slate-100">
								{playerName}
							</p>
							{expiresLabel && (
								<p className="text-[11px] text-slate-500">
									Session expires: {expiresLabel}
								</p>
							)}
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2 md:gap-3">
						<div className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs flex items-center gap-2">
							<span
								className={`inline-flex h-2 w-2 rounded-full ${phaseDotClass}`}
							/>
							<span className="text-slate-300 text-[11px] md:text-xs">
								{phaseLabel}
							</span>
						</div>

						<button
							onClick={onBackToJoin}
							className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900 transition"
						>
							← Back to Join
						</button>

						<button
							onClick={onLeaveRoom}
							className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/15 transition"
						>
							Leave Room
						</button>
					</div>
				</header>

				{/* If URL roomId doesn't match session roomId */}
				{mismatchRoom && (
					<div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-amber-100">
						<p className="text-sm font-semibold">Room mismatch</p>
						<p className="text-xs text-amber-100/80 mt-1">
							You opened a different room URL than the one you joined. Please go
							back and join the correct room.
						</p>
					</div>
				)}

				{/* Main */}
				<main className="grid grid-cols-1 lg:grid-cols-[2fr,1.3fr] gap-4">
					{/* Question panel (placeholder) */}
					<section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col gap-4">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div>
								<p className="text-[11px] uppercase tracking-[0.18em] text-sky-400/80 mb-1">
									Timer
								</p>
								<p className="text-sm font-medium text-slate-100">
									{timerLabel}
								</p>
							</div>

							<div className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1">
								<span className="text-[11px] text-slate-400 mr-1">
									Question Type
								</span>
								<span className="text-xs font-semibold text-sky-300">Text</span>
							</div>
						</div>

						<div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
							<p className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-1.5">
								Question
							</p>
							<p className="text-sm md:text-base text-slate-50 leading-relaxed">
								Waiting for the next question...
							</p>
						</div>

						<div className="mt-1">
							<div className="flex items-center justify-between gap-3">
								<p className="text-xs text-slate-400">Your answer</p>
								<p className="text-[11px] text-slate-500">
									Answering will be enabled once live game state is wired.
								</p>
							</div>

							<div className="mt-2 flex flex-col gap-3">
								<input
									type="text"
									value={answerText}
									onChange={(e) => setAnswerText(e.target.value)}
									disabled={!canAnswer || submittingAnswer}
									placeholder="Waiting..."
									className={[
										"w-full rounded-xl border bg-slate-950/60 px-3 py-2 text-sm text-slate-50",
										"placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500",
										"border-slate-800 opacity-50 cursor-not-allowed",
									].join(" ")}
								/>

								<button
									type="button"
									onClick={onSubmitAnswer}
									disabled={true}
									className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
								>
									{submittingAnswer ? "Submitting..." : "Submit Answer"}
								</button>
							</div>
						</div>
					</section>

					{/* Right: Buzzer + status (placeholder) */}
					<aside className="flex flex-col gap-4">
						<div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col items-center gap-3">
							<p className="text-xs text-slate-400 text-center">{helperText}</p>

							<button
								type="button"
								onClick={onBuzz}
								disabled={!canBuzz || mismatchRoom}
								className={[
									"rounded-full aspect-square px-10 py-10 md:px-14 md:py-14 text-xl md:text-2xl font-extrabold uppercase transition",
									"bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600",
								].join(" ")}
							>
								Buzz!
							</button>

							<p className="text-[11px] text-slate-500 text-center">
								Buzzer will be enabled once the host starts the buzz phase.
							</p>
						</div>

						<div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
							<p className="text-xs uppercase tracking-[0.18em] text-slate-500">
								Player Status
							</p>
							<p className="mt-1 text-sm text-slate-100">
								Waiting for host. Stay on this screen.
							</p>
						</div>
					</aside>
				</main>
			</div>
		</div>
	);
}
