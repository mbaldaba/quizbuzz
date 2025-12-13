import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { API_URL } from "@/common/constants";
import { getParticipantToken } from "@/common/helpers";
import {
	SOCKET_EVENTS,
	NextQuestionPayload,
	ScoresUpdatePayload,
	AnswerRevealedPayload,
	RoomJoinedPayload,
	ErrorPayload,
	ParticipantJoinedPayload,
	ParticipantLeftPayload,
	Phase,
} from "@/common/types";

import {
	connectRoomSocket,
	disconnectRoomSocket,
	emitJoinRoom,
	emitLeaveRoom,
	emitSubmitAnswer,
	// emitBuzz (future)
} from "@/modules/socket/roomSocket";
import { leaveRoomAsParticipant } from "@/modules/participants/participants.service";
import { useParticipantSession } from "@/modules/participants/useParticipantSession";


export default function StudentRoomView() {
	const navigate = useNavigate();
	const { roomId: roomIdParam } = useParams<{ roomId: string }>();

	const token = getParticipantToken();

	const [participantId, setParticipantId] = useState<string | null>(null);
	const [nickname, setNickname] = useState<string>("");

	const [question, setQuestion] = useState<NextQuestionPayload | null>(null);
	const [scores, setScores] = useState<ScoresUpdatePayload["scores"]>([]);
	const [revealed, setRevealed] = useState<AnswerRevealedPayload | null>(null);
	const [wsError, setWsError] = useState<ErrorPayload | null>(null);

	const [answerText, setAnswerText] = useState("");
	const [submittingAnswer, setSubmittingAnswer] = useState(false);

	const roomIdSafe = roomIdParam ?? "";

	const phase: Phase = question ? "answer" : "waiting";
	const timerLabel = question
		? "Answering is open…"
		: "Waiting for host to start the game...";
	const mismatchRoom = false;

	const phaseMeta = useMemo(() => {
		// if (phase === "buzz") return { label: "Buzz", dot: "bg-amber-400" }; // might remove since buzz phase is not included in backend
		if (phase === "answer") return { label: "Answer", dot: "bg-sky-400" };
		return { label: "Waiting", dot: "bg-slate-500" };
	}, [phase]);

	// const canBuzz = phase === "buzz" && !mismatchRoom; // might remove since buzz phase is not included in backend
	const canAnswer = phase === "answer" && !mismatchRoom;

	useEffect(() => {
		if (!roomIdSafe || !token) return;

		const s = connectRoomSocket(API_URL);

		const onRoomJoined = (p: RoomJoinedPayload) => {
			setParticipantId(p.participantId);
			setNickname(p.nickname);
			setWsError(null);
		};

		const onNextQuestion = (p: NextQuestionPayload) => {
			setQuestion(p);
			setRevealed(null);
			setAnswerText("");
			setSubmittingAnswer(false);
		};

		const onScoresUpdate = (p: ScoresUpdatePayload) => {
			setScores(p.scores);
		};

		const onAnswerRevealed = (p: AnswerRevealedPayload) => {
			setRevealed(p);
			setSubmittingAnswer(false);
		};

		const onError = (p: ErrorPayload) => setWsError(p);

		const onParticipantJoined = (_p: ParticipantJoinedPayload) => {};
		const onParticipantLeft = (_p: ParticipantLeftPayload) => {};

		s.on(SOCKET_EVENTS.ROOM_JOINED, onRoomJoined);
		s.on(SOCKET_EVENTS.NEXT_QUESTION, onNextQuestion);
		s.on(SOCKET_EVENTS.SCORES_UPDATE, onScoresUpdate);
		s.on(SOCKET_EVENTS.ANSWER_REVEALED, onAnswerRevealed);
		s.on(SOCKET_EVENTS.ERROR, onError);
		s.on(SOCKET_EVENTS.PARTICIPANT_JOINED, onParticipantJoined);
		s.on(SOCKET_EVENTS.PARTICIPANT_LEFT, onParticipantLeft);

		emitJoinRoom({ roomId: roomIdSafe, token });

		return () => {
			emitLeaveRoom({ roomId: roomIdSafe });
			disconnectRoomSocket();
		};
	}, [roomIdSafe, token]);

	const onBackToJoin = () => navigate("/", { replace: true });

	const onLeaveRoom = async () => {
		try {
			await leaveRoomAsParticipant();
		} finally {
			navigate("/", { replace: true });
		}
	};

	// might remove since buzz phase is not included in backend
	// const onBuzz = () => {
	// 	// TODO: add backend event + client emit when ready
	// 	// emitBuzz({ roomId: roomIdSafe })
	// };

	const onSubmitAnswer = async () => {
		if (!question) return;

		// For identification
		if (!question.choices?.length && (!canAnswer || !answerText.trim())) return;

		setSubmittingAnswer(true);

		if (question.choices?.length) {
			setSubmittingAnswer(false);
			return;
		}

		emitSubmitAnswer({
			questionId: question.questionId,
			answerText: answerText || undefined,
		});

		setAnswerText("");
	};

	const you = useMemo(() => {
		if (!participantId) return null;
		return scores.find((s) => s.participantId === participantId) ?? null;
	}, [scores, participantId]);

	const sortedScores = useMemo(() => {
		return [...scores].sort(
			(a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0)
		);
	}, [scores]);

	const helperText = mismatchRoom
		? "This room doesn't match your current session. Please re-join."
		: "You're connected. Waiting for the host to start the next question.";

	return (
		<div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6">
			<div className="mx-auto w-full max-w-6xl space-y-4">
				<header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2">
							<p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
								Quiz Room
							</p>
							<p className="font-mono text-sm text-sky-400">#{roomIdSafe}</p>
						</div>

						<div>
							<p className="text-xs text-slate-400">Player</p>
							<p className="text-sm font-semibold text-slate-100">
								{nickname || "Participant"}
							</p>
							<p className="text-[11px] text-slate-500">
								Your score:{" "}
								<span className="text-slate-200">{you?.totalScore ?? 0}</span>
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2 md:gap-3">
						<div className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs flex items-center gap-2">
							<span
								className={`inline-flex h-2 w-2 rounded-full ${phaseMeta.dot}`}
							/>
							<span className="text-slate-300 text-[11px] md:text-xs">
								{phaseMeta.label}
							</span>
						</div>

						<button
							onClick={() => navigate(`/room/${roomIdSafe}/leaderboard`)}
							className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900 transition"
						>
							View Leaderboard
						</button>

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

				{wsError && (
					<div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-red-100">
						<p className="text-sm font-semibold">Connection Error</p>
						<p className="text-xs text-red-100/80 mt-1">{wsError.message}</p>
					</div>
				)}

				<main className="grid grid-cols-1 lg:grid-cols-[2fr,1.3fr] gap-4">
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
									Question
								</span>
								<span className="text-xs font-semibold text-sky-300">
									{question ? `#${question.questionNumber}` : "—"}
								</span>
							</div>
						</div>

						<div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
							<p className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-1.5">
								Question
							</p>
							<p className="text-sm md:text-base text-slate-50 leading-relaxed">
								{question?.description ?? "Waiting for the next question..."}
							</p>
						</div>

						{question?.choices?.length ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{question.choices.map((c) => (
									<button
										key={c.id}
										type="button"
										disabled={!canAnswer || submittingAnswer}
										onClick={() => {
											if (!canAnswer) return;
											setSubmittingAnswer(true);
											emitSubmitAnswer({
												questionId: question.questionId,
												answerId: c.id,
											});
										}}
										className={[
											"rounded-xl border px-4 py-3 text-left text-sm font-semibold transition",
											!canAnswer || submittingAnswer
												? "border-slate-800 bg-slate-950/60 text-slate-400 cursor-not-allowed opacity-60"
												: "border-slate-700 bg-slate-950/70 hover:bg-slate-950 hover:border-slate-600 active:scale-[0.99]",
										].join(" ")}
									>
										{c.value}
									</button>
								))}
							</div>
						) : (
							<div className="mt-1">
								<div className="flex items-center justify-between gap-3">
									<p className="text-xs text-slate-400">Your answer</p>
									<p className="text-[11px] text-slate-500">
										{canAnswer
											? "Answering is enabled."
											: "Waiting for answer phase."}
									</p>
								</div>

								<div className="mt-2 flex flex-col gap-3">
									<input
										type="text"
										value={answerText}
										onChange={(e) => setAnswerText(e.target.value)}
										disabled={!canAnswer || submittingAnswer}
										placeholder={
											canAnswer ? "Type your answer..." : "Waiting..."
										}
										className={[
											"w-full rounded-xl border bg-slate-950/60 px-3 py-2 text-sm text-slate-50",
											"placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500",
											canAnswer
												? "border-slate-700"
												: "border-slate-800 opacity-50 cursor-not-allowed",
										].join(" ")}
									/>

									<button
										type="button"
										onClick={onSubmitAnswer}
										disabled={
											!canAnswer || submittingAnswer || !answerText.trim()
										}
										className={[
											"inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold border transition",
											!canAnswer || submittingAnswer || !answerText.trim()
												? "bg-slate-800 text-slate-400 cursor-not-allowed border-slate-700"
												: "bg-white text-slate-950 border-white hover:bg-slate-200 active:scale-[0.99]",
										].join(" ")}
									>
										{submittingAnswer ? "Submitting..." : "Submit Answer"}
									</button>
								</div>
							</div>
						)}

						{revealed && (
							<div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
								<p className="text-sm font-semibold text-emerald-100">
									Answer Revealed
								</p>
								<p className="text-xs text-emerald-100/80 mt-1">
									Correct:{" "}
									<span className="font-semibold">
										{revealed.correctAnswerValue}
									</span>
								</p>
								{revealed.firstCorrectParticipant && (
									<p className="text-[11px] text-emerald-200/80 mt-1">
										First correct: {revealed.firstCorrectParticipant.nickname}
									</p>
								)}
							</div>
						)}
					</section>

					<aside className="flex flex-col gap-4">
						{/* might remove since buzz phase is not included in backend */}
						{/* <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col items-center gap-3">
							<p className="text-xs text-slate-400 text-center">{helperText}</p>

							<button
								type="button"
								onClick={onBuzz}
								disabled={!canBuzz || mismatchRoom}
								className={[
									"rounded-full aspect-square px-10 py-10 md:px-14 md:py-14 text-xl md:text-2xl font-extrabold uppercase transition border",
									canBuzz && !mismatchRoom
										? "bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 active:scale-[0.99]"
										: "bg-slate-700 text-slate-400 cursor-not-allowed border-slate-600",
								].join(" ")}
							>
								Buzz!
							</button>

							<p className="text-[11px] text-slate-500 text-center">
								Buzzer will be enabled once the host starts the buzz phase.
							</p>
						</div> */}
						<div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
							<p className="text-xs uppercase tracking-[0.18em] text-slate-500">
								Live Scores
							</p>

							<ol className="mt-3 space-y-2">
								{sortedScores.slice(0, 8).map((s, idx) => {
									const isMe = participantId === s.participantId;
									return (
										<li
											key={s.participantId}
											className={[
												"flex items-center justify-between rounded-xl border px-3 py-2 text-sm",
												isMe
													? "border-sky-400/30 bg-sky-500/10 text-sky-100"
													: "border-slate-800 bg-slate-950/40 text-slate-100",
											].join(" ")}
										>
											<span className="flex items-center gap-2">
												<span className="w-6 text-xs text-slate-500">
													#{idx + 1}
												</span>
												<span className={isMe ? "font-semibold" : ""}>
													{s.nickname} {isMe ? "(you)" : ""}
												</span>
											</span>
											<span className="font-semibold">{s.totalScore}</span>
										</li>
									);
								})}

								{sortedScores.length === 0 && (
									<li className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-400">
										No scores yet.
									</li>
								)}
							</ol>

							<button
								onClick={() => navigate(`/room/${roomIdSafe}/leaderboard`)}
								className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900 transition"
							>
								View full leaderboard
							</button>
						</div>
					</aside>
				</main>
			</div>
		</div>
	);
}
