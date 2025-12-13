import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import CreateRoomForm from "../components/CreateRoomForm/CreateRoomForm";
import RoomList from "../components/RoomList/RoomList";
import RoomDetails from "../components/RoomDetails/RoomDetails";
import QuestionManager from "../components/QuestionManager/QuestionManager";
import { IActiveRoom, IQuestionData, ActiveRoomEnum, IPlayer } from "../common/types";
import { useLogout, useSession } from "../hooks/useAuth";
import {
	getQuestions,
	createQuestion,
	updateQuestion,
	deleteQuestion,
	mapQuestionToApiCreate,
	mapQuestionToApiUpdate,
	mapQuestionFromApi,
	getRooms,
	createRoom,
	deleteRoom,
	startRoom,
	endRoom,
	mapRoomFromApi,
	mapRoomToApiCreate,
} from "../common/api";

export default function AdminDashboard() {
	const [rooms, setRooms] = useState<IActiveRoom[]>([]);
	const [questions, setQuestions] = useState<IQuestionData[]>([]);
	const [selectedRoom, setSelectedRoom] = useState<IActiveRoom | null>(null);
	const [players, setPlayers] = useState<IPlayer[]>([]);
	const [questionsLoading, setQuestionsLoading] = useState(true);
	const [questionsError, setQuestionsError] = useState<string | null>(null);
	const [roomsLoading, setRoomsLoading] = useState(true);
	const [roomsError, setRoomsError] = useState<string | null>(null);
	
	const { data: session } = useSession();
	const logoutMutation = useLogout();

	// Fetch questions on mount
	useEffect(() => {
		const fetchQuestions = async () => {
			try {
				setQuestionsLoading(true);
				setQuestionsError(null);
				const response = await getQuestions({ perPage: 100 }); // Fetch all questions
				const mappedQuestions = response.data.map(mapQuestionFromApi);
				setQuestions(mappedQuestions);
			} catch (error) {
				console.error("Failed to fetch questions:", error);
				const errorMessage = error instanceof Error ? error.message : "Failed to load questions";
				setQuestionsError(errorMessage);
			} finally {
				setQuestionsLoading(false);
			}
		};

		if (session) {
			fetchQuestions();
		}
	}, [session]);

	// Fetch rooms on mount
	useEffect(() => {
		const fetchRooms = async () => {
			try {
				setRoomsLoading(true);
				setRoomsError(null);
				const response = await getRooms({ perPage: 100 }); // Fetch all rooms
				const mappedRooms = response.data.map((room) => 
					mapRoomFromApi(room, session?.username || "You")
				);
				setRooms(mappedRooms);
			} catch (error) {
				console.error("Failed to fetch rooms:", error);
				const errorMessage = error instanceof Error ? error.message : "Failed to load rooms";
				setRoomsError(errorMessage);
			} finally {
				setRoomsLoading(false);
			}
		};

		if (session) {
			fetchRooms();
		}
	}, [session]);

	const handleLogout = async () => {
		try {
			await logoutMutation.mutateAsync();
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const handleCreateRoom = async (roomData: {
		title: string;
		maxPlayers?: number;
		requiresPassword: boolean;
		password?: string;
	}) => {
		try {
			const apiRoomData = mapRoomToApiCreate(roomData);
			const created = await createRoom(apiRoomData);
			const mappedRoom = mapRoomFromApi(created, session?.username || "You");
			setRooms([mappedRoom, ...rooms]);
			toast.success("Room created successfully");
		} catch (error) {
			console.error("Failed to create room:", error);
			const errorMessage = error instanceof Error ? error.message : "Failed to create room";
			toast.error(errorMessage);
			throw error;
		}
	};

	const handleDeleteRoom = async (roomId: string) => {
		try {
			await deleteRoom(roomId);
			setRooms(rooms.filter((room) => room.id !== roomId));
			if (selectedRoom?.id === roomId) {
				setSelectedRoom(null);
			}
			toast.success("Room deleted successfully");
		} catch (error) {
			console.error("Failed to delete room:", error);
			const errorMessage = error instanceof Error ? error.message : "Failed to delete room";
			toast.error(errorMessage);
			throw error;
		}
	};

	const handleStartRoom = async (roomId: string) => {
		try {
			const updated = await startRoom(roomId);
			const mappedRoom = mapRoomFromApi(updated, session?.username || "You");
			setRooms(
				rooms.map((room) =>
					room.id === roomId ? mappedRoom : room
				)
			);
			toast.success("Room started successfully");
		} catch (error) {
			console.error("Failed to start room:", error);
			const errorMessage = error instanceof Error ? error.message : "Failed to start room";
			toast.error(errorMessage);
			throw error;
		}
	};

	const handleEndRoom = async (roomId: string) => {
		try {
			const updated = await endRoom(roomId);
			const mappedRoom = mapRoomFromApi(updated, session?.username || "You");
			setRooms(
				rooms.map((room) =>
					room.id === roomId ? mappedRoom : room
				)
			);
			toast.success("Room ended successfully");
		} catch (error) {
			console.error("Failed to end room:", error);
			const errorMessage = error instanceof Error ? error.message : "Failed to end room";
			toast.error(errorMessage);
			throw error;
		}
	};

	const handleRoomClick = (room: IActiveRoom) => {
		setSelectedRoom(room);
		// In real app, fetch players for this room
	};

	const handleAddQuestion = async (question: Omit<IQuestionData, "id">) => {
		try {
			const apiQuestion = mapQuestionToApiCreate(question);
			const created = await createQuestion(apiQuestion);
			const mappedQuestion = mapQuestionFromApi(created);
			setQuestions((prev) => [mappedQuestion, ...prev]);
			toast.success("Question created successfully");
		} catch (error) {
			console.error("Failed to create question:", error);
			const errorMessage = error instanceof Error ? error.message : "Failed to create question";
			toast.error(errorMessage);
			throw error;
		}
	};

	const handleUpdateQuestion = async (
		questionId: string,
		question: Omit<IQuestionData, "id">
	) => {
		try {
			const apiQuestion = mapQuestionToApiUpdate(question);
			const updated = await updateQuestion(questionId, apiQuestion);
			const mappedQuestion = mapQuestionFromApi(updated);
			setQuestions((prev) =>
				prev.map((q) =>
					q.id === questionId ? mappedQuestion : q
				)
			);
			toast.success("Question updated successfully");
		} catch (error) {
			console.error("Failed to update question:", error);
			const errorMessage = error instanceof Error ? error.message : "Failed to update question";
			toast.error(errorMessage);
			throw error;
		}
	};

	const handleDeleteQuestion = async (questionId: string) => {
		try {
			await deleteQuestion(questionId);
			setQuestions((prev) => prev.filter((q) => q.id !== questionId));
			toast.success("Question deleted successfully");
		} catch (error) {
			console.error("Failed to delete question:", error);
			const errorMessage = error instanceof Error ? error.message : "Failed to delete question";
			toast.error(errorMessage);
			throw error;
		}
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
					{/* Left: Create Room */}
					<section className="admin-section">
						<div className="section-header">
							<div className="flex-1">
								<h2 className="section-title">
									Create New Room
								</h2>
								<p className="section-subtitle">
									Set up a new quiz room for players to join
								</p>
							</div>
						</div>
						<CreateRoomForm
							onCreate={handleCreateRoom}
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
						{roomsError && (
							<div style={{ padding: "1rem", background: "#fee", color: "#c33", borderRadius: "0.5rem", marginBottom: "1rem" }}>
								Error loading rooms: {roomsError}
							</div>
						)}
						<RoomList
							rooms={rooms}
							onRoomClick={handleRoomClick}
							onStartRoom={handleStartRoom}
							onEndRoom={handleEndRoom}
							onDeleteRoom={handleDeleteRoom}
						/>
						{roomsLoading && (
							<div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
								Loading rooms...
							</div>
						)}
					</section>
				</div>

				{/* Question Manager */}
				{questionsError && (
					<div style={{ padding: "1rem", background: "#fee", color: "#c33", borderRadius: "0.5rem", marginBottom: "1rem" }}>
						Error loading questions: {questionsError}
					</div>
				)}
				<QuestionManager
					questions={questions}
					onAddQuestion={handleAddQuestion}
					onUpdateQuestion={handleUpdateQuestion}
					onDeleteQuestion={handleDeleteQuestion}
				/>
				{questionsLoading && (
					<div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
						Loading questions...
					</div>
				)}
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

