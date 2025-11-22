import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { IPlayerScore } from "../common/types";

type RoomScoreboardViewProps = {
	roomCode: string;
	questionNumber?: number;
	totalQuestions?: number;
	players: IPlayerScore[];
};

export default function RoomScoreboardView({
	roomCode,
	questionNumber,
	totalQuestions,
	players,
}: RoomScoreboardViewProps) {
  const navigate = useNavigate();

	// Sort players by score desc, then name
	const rankedPlayers = useMemo(() => {
		const sorted = [...players].sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			return a.name.localeCompare(b.name);
		});

		return sorted.map((player, index) => ({
			...player,
			rank: index + 1,
		}));
	}, [players]);

	const leader = rankedPlayers[0];

	const formatRankLabel = (rank: number) => {
		if (rank === 1) return "1st";
		if (rank === 2) return "2nd";
		if (rank === 3) return "3rd";
		return `${rank}th`;
	};

	const getMedalClass = (rank: number) => {
		if (rank === 1)
			return "bg-yellow-400/90 text-slate-900 border-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.6)]";
		if (rank === 2)
			return "bg-slate-300 text-slate-900 border-slate-200 shadow-[0_0_20px_rgba(209,213,219,0.5)]";
		if (rank === 3)
			return "bg-amber-600/90 text-slate-50 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]";
		return "bg-slate-800 text-slate-200 border-slate-700";
	};

	return (
		<div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-6">
			<div className="w-full max-w-5xl space-y-4">
				{/* Header */}
				<header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2">
							<p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
								Room Leaderboard
							</p>
							<p className="font-mono text-sm text-sky-400">
								#{roomCode || "------"}
							</p>
						</div>
						{typeof questionNumber === "number" &&
							typeof totalQuestions === "number" && (
								<div>
									<p className="text-xs text-slate-400">Progress</p>
									<p className="text-sm font-semibold text-slate-100">
										Question {questionNumber} / {totalQuestions}
									</p>
								</div>
							)}
					</div>

					<button
						onClick={() => navigate("/room")}
						className="ml-auto rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-500 text-slate-950 font-semibold text-xs px-4 py-2 transition border border-sky-300"
					>
						← Back to Room
					</button>

					{leader && (
						<div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3">
							<div
								className={`h-9 w-9 rounded-full border flex items-center justify-center text-xs font-bold ${getMedalClass(1)}`}
							>
								1ST
							</div>
							<div>
								<p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
									Current Leader
								</p>
								<p className="text-sm font-semibold text-slate-50">
									{leader.name}
								</p>
								<p className="text-xs text-slate-400">
									{leader.score} pts
									{typeof leader.correctAnswers === "number" && (
										<span className="ml-2">
											· {leader.correctAnswers} correct
										</span>
									)}
								</p>
							</div>
						</div>
					)}
				</header>

				{/* Leaderboard table */}
				<section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6">
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-sm font-semibold text-slate-100">Scoreboard</h2>
						<p className="text-[11px] text-slate-500">
							Sorted by highest score · {players.length}{" "}
							{players.length === 1 ? "player" : "players"}
						</p>
					</div>

					<div className="overflow-x-auto">
						<table className="min-w-full text-sm border-collapse">
							<thead>
								<tr className="border-b border-slate-800 text-xs text-slate-400">
									<th className="text-left py-2 pr-3">Rank</th>
									<th className="text-left py-2 pr-3">Player</th>
									<th className="text-right py-2 pr-3">Score</th>
									<th className="text-right py-2 pr-3 hidden sm:table-cell">
										Correct
									</th>
									<th className="text-right py-2 pr-1 hidden sm:table-cell">
										Wrong
									</th>
								</tr>
							</thead>
							<tbody>
								{rankedPlayers.map((player) => {
									const isTop3 = player.rank <= 3;
									const isYou = player.isYou;

									return (
										<tr
											key={player.id}
											className={`border-b border-slate-900/60 last:border-b-0 ${
												isYou ? "bg-slate-900/70" : "hover:bg-slate-900/60"
											}`}
										>
											{/* Rank */}
											<td className="py-2.5 pr-3 align-middle">
												<div className="flex items-center gap-2">
													<div
														className={`h-7 w-7 rounded-full border flex items-center justify-center text-[11px] font-semibold ${getMedalClass(
															player.rank
														)}`}
													>
														{isTop3
															? player.rank === 1
																? "1st"
																: player.rank === 2
																	? "2nd"
																	: "3rd"
															: formatRankLabel(player.rank)}
													</div>
												</div>
											</td>

											{/* Player name */}
											<td className="py-2.5 pr-3 align-middle">
												<div className="flex flex-col">
													<span
														className={`text-sm ${
															isYou
																? "font-semibold text-sky-300"
																: "text-slate-100"
														}`}
													>
														{player.name}
														{isYou && (
															<span className="ml-1 text-[10px] uppercase tracking-[0.18em] text-sky-400">
																(You)
															</span>
														)}
													</span>
													{isTop3 && (
														<span className="text-[11px] text-slate-500">
															{player.rank === 1
																? "On fire!"
																: player.rank === 2
																	? "Close behind"
																	: "In the top 3"}
														</span>
													)}
												</div>
											</td>

											{/* Score */}
											<td className="py-2.5 pr-3 align-middle text-right">
												<span className="text-sm font-semibold text-slate-50">
													{player.score}
												</span>
												<span className="text-[11px] text-slate-500 ml-1">
													pts
												</span>
											</td>

											{/* Correct answers */}
											<td className="py-2.5 pr-3 align-middle text-right hidden sm:table-cell">
												<span className="text-sm text-emerald-300">
													{typeof player.correctAnswers === "number"
														? player.correctAnswers
														: "-"}
												</span>
											</td>

											{/* Wrong answers */}
											<td className="py-2.5 pr-1 align-middle text-right hidden sm:table-cell">
												<span className="text-sm text-rose-300">
													{typeof player.wrongAnswers === "number"
														? player.wrongAnswers
														: "-"}
												</span>
											</td>
										</tr>
									);
								})}

								{rankedPlayers.length === 0 && (
									<tr>
										<td
											colSpan={5}
											className="py-6 text-center text-sm text-slate-500"
										>
											No players yet. Scores will appear here once the game
											starts.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</div>
	);
}
