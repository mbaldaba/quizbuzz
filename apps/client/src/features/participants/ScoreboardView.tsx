import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
	SOCKET_EVENTS,
	ScoresUpdatePayload,
	QuizEndedPayload,
	ErrorPayload,
} from "@/common/types";

import {
	connectRoomSocket,
	disconnectRoomSocket,
	emitJoinRoom,
	emitLeaveRoom,
} from "@/modules/socket/roomSocket";
import { SOCKET_URL } from "@/common/constants";

export default function ScoreboardView() {
	const navigate = useNavigate();
	const { roomId } = useParams<{ roomId: string }>();

	const token = localStorage.getItem("participant_room_token") ?? "";

	const [scores, setScores] = useState<ScoresUpdatePayload["scores"]>([]);
	const [quizEnded, setQuizEnded] = useState(false);
	const [error, setError] = useState<ErrorPayload | null>(null);

	const roomIdSafe = roomId ?? "";

	useEffect(() => {
		if (!roomIdSafe || !token) return;

		const socket = connectRoomSocket(SOCKET_URL);

		socket.on(SOCKET_EVENTS.SCORES_UPDATE, (payload: ScoresUpdatePayload) => {
			setScores(payload.scores);
		});

		socket.on(SOCKET_EVENTS.QUIZ_ENDED, (_payload: QuizEndedPayload) => {
			setQuizEnded(true);
		});

		socket.on(SOCKET_EVENTS.ERROR, (payload: ErrorPayload) => {
			setError(payload);
		});

		emitJoinRoom({ roomId: roomIdSafe, token });

		return () => {
			emitLeaveRoom({ roomId: roomIdSafe });
			disconnectRoomSocket();
		};
	}, [roomIdSafe, token]);

	const sortedScores = useMemo(() => {
		return [...scores].sort(
			(a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0)
		);
	}, [scores]);

	return (
		<div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6">
			<div className="mx-auto w-full max-w-4xl space-y-5">
				<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2">
							<p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
								Leaderboard
							</p>
							<p className="font-mono text-sm text-sky-400">#{roomIdSafe}</p>
						</div>
					</div>

					<button
						onClick={() => navigate(`/room/${roomIdSafe}`)}
						className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900 transition"
					>
						← Back to Room
					</button>
				</header>

				{error && (
					<div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-red-100">
						<p className="text-sm font-semibold">Connection Error</p>
						<p className="text-xs text-red-100/80 mt-1">{error.message}</p>
					</div>
				)}

				{sortedScores.length > 0 && (
					<section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6">
						<h2 className="text-sm font-semibold text-slate-200 mb-4">
							Top Players
						</h2>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							{sortedScores.slice(0, 3).map((p, idx) => {
								const podiumStyles = [
									"border",
									idx === 0
										? "border-amber-400/40 bg-amber-500/10"
										: idx === 1
											? "border-slate-400/30 bg-slate-500/10"
											: "border-orange-400/30 bg-orange-500/10",
								].join(" ");

								return (
									<div
										key={p.participantId}
										className={`rounded-2xl p-4 text-center ${podiumStyles}`}
									>
										<p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
											#{idx + 1}
										</p>
										<p className="mt-1 font-semibold text-slate-100">
											{p.nickname}
										</p>
										<p className="mt-1 text-sm font-bold text-slate-50">
											{p.totalScore} pts
										</p>
									</div>
								);
							})}
						</div>
					</section>
				)}

				<section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-semibold text-slate-200">
							Full Rankings
						</h3>
						<span className="text-xs text-slate-500">
							{sortedScores.length} player(s)
						</span>
					</div>

					<ol className="space-y-2">
						{sortedScores.map((s, idx) => (
							<li
								key={s.participantId}
								className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm"
							>
								<span className="flex items-center gap-3">
									<span className="w-6 text-xs text-slate-500">#{idx + 1}</span>
									<span className="font-medium text-slate-100">
										{s.nickname}
									</span>
								</span>
								<span className="font-semibold">{s.totalScore}</span>
							</li>
						))}

						{sortedScores.length === 0 && (
							<li className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-400">
								No scores yet.
							</li>
						)}
					</ol>
				</section>

				<footer className="text-center text-xs text-slate-500">
					{quizEnded
						? "Quiz ended 🎉"
						: "Live leaderboard · updates in real time"}
				</footer>
			</div>
		</div>
	);
}
