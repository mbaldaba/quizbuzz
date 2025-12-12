import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinRoomAsParticipant } from "@/modules/participants/participants.service";

export default function StudentJoinView() {
	const navigate = useNavigate();

	const [roomId, setRoomId] = useState("");
	const [nickname, setNickname] = useState("");
	const [password, setPassword] = useState("");

	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!roomId.trim()) return setError("Please enter the Room ID.");
		if (!nickname.trim()) return setError("Please enter your nickname.");

		setError(null);
		setSubmitting(true);

		try {
			const data = await joinRoomAsParticipant({
				roomId: roomId.trim(),
				nickname: nickname.trim(),
				password: password.trim() || undefined,
			});

			navigate(`/room/${data.roomId}`, { replace: true });
		} catch (err: any) {
			const status = err?.response?.status;
			if (status === 404) setError("Room not found.");
			else if (status === 401) setError("Invalid room password.");
			else setError("Something went wrong. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
			<div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/50">
				<div className="mb-6">
					<p className="text-xs uppercase tracking-[0.2em] text-sky-400/80 mb-2">
						QuizBuzz Student
					</p>
					<h1 className="text-2xl font-semibold text-slate-50">
						Join a Quiz Room
					</h1>
					<p className="mt-2 text-sm text-slate-400">
						Enter the Room ID shared by your teacher/host.
					</p>
				</div>

				{error && (
					<div className="mb-4 rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs text-red-300">
						{error}
					</div>
				)}

				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div>
						<label className="block text-sm font-medium text-slate-200 mb-1.5">
							Room ID
						</label>
						<input
							value={roomId}
							onChange={(e) => setRoomId(e.target.value)}
							placeholder="e.g. cmj2q9of10003nirc8ejmnyr8"
							className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-200 mb-1.5">
							Nickname
						</label>
						<input
							value={nickname}
							onChange={(e) => setNickname(e.target.value)}
							placeholder="e.g. player1"
							className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-200 mb-1.5">
							Room Password{" "}
							<span className="text-xs text-slate-500">(if required)</span>
						</label>
						<input
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							type="password"
							placeholder="Enter room password"
							className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-500"
						/>
					</div>

					<button
						type="submit"
						disabled={submitting || !roomId.trim() || !nickname.trim()}
						className="w-full inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 active:bg-sky-500/90 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-950 transition disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{submitting ? "Joining..." : "Join Room"}
					</button>
				</form>

				<p className="mt-4 text-[11px] text-slate-500">
					Only join rooms shared by your teacher or host.
				</p>
			</div>
		</div>
	);
}
