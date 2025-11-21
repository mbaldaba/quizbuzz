import React, { useState } from "react";
import { ActiveRoomEnum, IActiveRoom } from "../common/types";

type StudentJoinViewProps = {
	activeRooms: IActiveRoom[];
	onJoin: (roomNumber: string, password: string) => void;
};

export default function StudentJoinView({
	activeRooms,
	onJoin,
}: StudentJoinViewProps) {
	const [roomNumber, setRoomNumber] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!roomNumber.trim()) {
			setError("Please enter a room number.");
			return;
		}
		if (!password.trim()) {
			setError("Please enter the room password.");
			return;
		}
		setError("");
		onJoin(roomNumber.trim(), password.trim());
	};

	const handleQuickJoin = (room: IActiveRoom) => {
		setRoomNumber(room.roomNumber);
		if (!room.requiresPassword) {
			setPassword("");
		}
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
			<div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] gap-8">
				{/* Left: Join form */}
				<section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-950/50">
					<div className="mb-6">
						<p className="text-xs uppercase tracking-[0.2em] text-sky-400/80 mb-2">
							QuizzBuzz Student
						</p>
						<h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
							Join a Quiz Room
						</h1>
						<p className="mt-2 text-sm text-slate-400">
							Enter the room number and password shared by your teacher or quiz
							host to join the game.
						</p>
					</div>

					<form
						onSubmit={handleSubmit}
						className="space-y-4"
					>
						<div>
							<label
								htmlFor="roomNumber"
								className="block text-sm font-medium text-slate-200 mb-1.5"
							>
								Room Number
							</label>
							<input
								id="roomNumber"
								type="text"
								value={roomNumber}
								onChange={(e) => setRoomNumber(e.target.value)}
								placeholder="e.g., 482913"
								className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-500"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-slate-200 mb-1.5"
							>
								Room Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter room password"
								className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-500"
							/>
						</div>

						{error && (
							<p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
								{error}
							</p>
						)}

						<button
							type="submit"
							className="w-full inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 active:bg-sky-500/90 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-950 transition"
						>
							Join Room
						</button>

						<p className="text-[11px] text-slate-500 mt-1">
							Tip: You can also tap a room on the right to auto-fill the room
							number.
						</p>
					</form>
				</section>

				{/* Right: Active rooms */}
				<section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col max-h-[560px]">
					<div className="flex items-center justify-between gap-3 mb-4">
						<div>
							<h2 className="text-lg md:text-xl font-semibold text-slate-50">
								Active Quiz Rooms
							</h2>
							<p className="text-xs text-slate-400 mt-1">
								Choose a room you were invited to, then join using the details
								on the left.
							</p>
						</div>
						<span className="inline-flex items-center justify-center rounded-full bg-slate-900 border border-slate-700 px-3 py-1 text-[11px] text-slate-300">
							{activeRooms.length} {activeRooms.length === 1 ? "room" : "rooms"}{" "}
							active
						</span>
					</div>

					<div className="flex-1 overflow-y-auto pr-1 space-y-3">
						{activeRooms.length === 0 && (
							<p className="text-sm text-slate-500 italic">
								No active rooms right now. Your teacher or host will create a
								room and share the room number with you.
							</p>
						)}

						{activeRooms.map((room) => (
							<button
								key={room.id}
								type="button"
								onClick={() => handleQuickJoin(room)}
								className="w-full text-left rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5 hover:border-sky-500/70 hover:bg-slate-900 transition group"
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-sm font-semibold text-slate-50 group-hover:text-sky-100">
											{room.title || `Room ${room.roomNumber}`}
										</p>
										<p className="text-[11px] text-slate-400 mt-0.5">
											Room number:{" "}
											<span className="font-mono text-slate-200">
												{room.roomNumber}
											</span>
										</p>
										<p className="text-[11px] text-slate-500 mt-0.5">
											Host:{" "}
											<span className="font-medium text-slate-300">
												{room.hostName}
											</span>
										</p>
									</div>

									<div className="flex flex-col items-end gap-1">
										<span
											className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
												room.status === ActiveRoomEnum.WAITING
													? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
													: "bg-amber-500/15 text-amber-300 border border-amber-500/40"
											}`}
										>
											{room.status}
										</span>
										<span className="text-[11px] text-slate-400">
											{room.players}
											{typeof room.maxPlayers === "number"
												? ` / ${room.maxPlayers}`
												: ""}{" "}
											players
										</span>
										{room.requiresPassword && (
											<span className="text-[10px] text-slate-500">
												Password required
											</span>
										)}
									</div>
								</div>
							</button>
						))}
					</div>

					<p className="text-[11px] text-slate-500 mt-3">
						Only join rooms your teacher or quiz host has assigned to you.
					</p>
				</section>
			</div>
		</div>
	);
}
