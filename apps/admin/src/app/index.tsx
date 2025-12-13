import { useState } from "react";
import CreateRoomForm from "../components/CreateRoomForm/CreateRoomForm";
import RoomList from "../components/RoomList/RoomList";
import RoomDetails from "../components/RoomDetails/RoomDetails";
import QuestionManager from "../components/QuestionManager/QuestionManager";
import { IActiveRoom, IQuestionData, ActiveRoomEnum, IPlayer } from "../common/types";
import { mockActiveRooms, mockPlayers, mockQuestions } from "../data/staticData";
import { useLogout, useSession } from "../hooks/useAuth";

function generateRoomNumber(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";
	for (let i = 0; i < 4; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

export default function AdminDashboard() {
	const [rooms, setRooms] = useState<IActiveRoom[]>(mockActiveRooms);
	const [questions, setQuestions] = useState<IQuestionData[]>(mockQuestions);
	const [selectedRoom, setSelectedRoom] = useState<IActiveRoom | null>(null);
	const [editingRoom, setEditingRoom] = useState<IActiveRoom | null>(null);
	const [players, setPlayers] = useState<IPlayer[]>(mockPlayers);
	
	const { data: session } = useSession();
	const logoutMutation = useLogout();

	const handleLogout = async () => {
		try {
			await logoutMutation.mutateAsync();
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const handleCreateRoom = (roomData: {
		title: string;
		maxPlayers?: number;
		requiresPassword: boolean;
		password?: string;
	}) => {
		const newRoom: IActiveRoom = {
			id: rooms.length + 1,
			roomNumber: generateRoomNumber(),
			title: roomData.title,
			hostName: "You", // In real app, this would come from auth
			status: ActiveRoomEnum.WAITING,
			players: 0,
			maxPlayers: roomData.maxPlayers,
			requiresPassword: roomData.requiresPassword,
			password: roomData.password || null,
			createdAt: new Date().toISOString(),
		};
		setRooms([newRoom, ...rooms]);
		setEditingRoom(null);
	};

	const handleUpdateRoom = (
		roomId: number,
		roomData: {
			title: string;
			maxPlayers?: number;
			requiresPassword: boolean;
			password?: string;
		}
	) => {
		setRooms(
			rooms.map((room) =>
				room.id === roomId
					? {
							...room,
							title: roomData.title,
							maxPlayers: roomData.maxPlayers,
							requiresPassword: roomData.requiresPassword,
							password: roomData.requiresPassword
								? roomData.password || null
								: null,
						}
					: room
			)
		);
		setEditingRoom(null);
	};

	const handleDeleteRoom = (roomId: number) => {
		setRooms(rooms.filter((room) => room.id !== roomId));
		if (selectedRoom?.id === roomId) {
			setSelectedRoom(null);
		}
		if (editingRoom?.id === roomId) {
			setEditingRoom(null);
		}
	};

	const handleStartRoom = (roomId: number) => {
		setRooms(
			rooms.map((room) =>
				room.id === roomId
					? { ...room, status: ActiveRoomEnum.ONGOING }
					: room
			)
		);
	};

	const handleEndRoom = (roomId: number) => {
		setRooms(
			rooms.map((room) =>
				room.id === roomId ? { ...room, status: ActiveRoomEnum.ENDED } : room
			)
		);
	};

	const handleRoomClick = (room: IActiveRoom) => {
		setSelectedRoom(room);
		// In real app, fetch players for this room
	};

	const handleAddQuestion = (question: Omit<IQuestionData, "id">) => {
		const newQuestion: IQuestionData = {
			...question,
			id: `q${Date.now()}`,
		};
		setQuestions([...questions, newQuestion]);
	};

	const handleUpdateQuestion = (
		questionId: string,
		question: Omit<IQuestionData, "id">
	) => {
		setQuestions(
			questions.map((q) =>
				q.id === questionId ? { ...q, ...question } : q
			)
		);
	};

	const handleDeleteQuestion = (questionId: string) => {
		setQuestions(questions.filter((q) => q.id !== questionId));
	};

	return (
		<div className="admin-container">
			<div className="admin-content">
				{/* Header */}
				<div className="admin-header">
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
						<div style={{ flex: 1 }}>
							<p className="admin-label">
								QuizzBuzz Admin
							</p>
							<h1 className="admin-title">
								Quiz Master Dashboard
							</h1>
							<p className="admin-subtitle">
								Create and manage quiz rooms, questions, and monitor player activity
							</p>
						</div>
						<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
							{session && (
								<div style={{ fontSize: "0.75rem", color: "rgba(148, 163, 184, 0.8)", marginBottom: "0.25rem" }}>
									Logged in as <strong style={{ color: "rgb(148, 163, 184)" }}>{session.username}</strong>
								</div>
							)}
							<button
								onClick={handleLogout}
								disabled={logoutMutation.isPending}
								className="btn btn-secondary"
								style={{ fontSize: "0.75rem", padding: "0.5rem 0.75rem" }}
							>
								{logoutMutation.isPending ? "Logging out..." : "Logout"}
							</button>
						</div>
					</div>
				</div>

				{/* Main Content Grid */}
				<div className="admin-grid">
					{/* Left: Create/Edit Room */}
					<section className="admin-section">
						<div className="section-header">
							<div className="flex-1">
								<h2 className="section-title">
									{editingRoom ? "Edit Room" : "Create New Room"}
								</h2>
								<p className="section-subtitle">
									{editingRoom
										? "Update room details"
										: "Set up a new quiz room for players to join"}
								</p>
							</div>
						</div>
						<CreateRoomForm
							onCreate={handleCreateRoom}
							onUpdate={handleUpdateRoom}
							editingRoom={editingRoom}
							onCancel={() => setEditingRoom(null)}
						/>
					</section>

					{/* Right: Active Rooms */}
					<section className="admin-section section-secondary">
						<div className="section-header">
							<div className="flex-1">
								<h2 className="section-title">
									My Quiz Rooms
								</h2>
								<p className="section-subtitle">
									Manage your active quiz rooms
								</p>
							</div>
							<span className="section-badge">
								{rooms.length}{" "}
								{rooms.length === 1 ? "room" : "rooms"}
							</span>
						</div>

						<RoomList
							rooms={rooms}
							onRoomClick={handleRoomClick}
							onStartRoom={handleStartRoom}
							onEndRoom={handleEndRoom}
							onEditRoom={setEditingRoom}
							onDeleteRoom={handleDeleteRoom}
						/>
					</section>
				</div>

				{/* Question Manager */}
				<QuestionManager
					questions={questions}
					onAddQuestion={handleAddQuestion}
					onUpdateQuestion={handleUpdateQuestion}
					onDeleteQuestion={handleDeleteQuestion}
				/>
			</div>

			{/* Room Details Modal */}
			{selectedRoom && (
				<RoomDetails
					room={selectedRoom}
					players={players}
					questions={questions}
					onClose={() => setSelectedRoom(null)}
				/>
			)}
		</div>
	);
}

