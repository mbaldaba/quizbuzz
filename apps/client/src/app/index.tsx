import { Route, Routes, useNavigate } from "react-router-dom";
import StudentJoinView from "../components/StudentJoinView";
import { activeRoomsFromServer, sampleRoomPlayers } from "../data/staticData";
import ProtectedClientPage from "../components/ProtectedClientPage";
import StudentRoomView from "../components/StudentRoomView";
import { setToken } from "../common/helpers";
import RoomScoreboardView from "../components/RoomScoreboardView";

function App() {
	const navigate = useNavigate();

	const handleClickJoin = () => {
		// TODO: join endpoint here
		setToken("insert New Token");
		navigate("/room");
	}

  return (
		<>
			<Routes>
				<Route
					path="/"
					element={
						<StudentJoinView
							activeRooms={activeRoomsFromServer}
							onJoin={handleClickJoin}
						/>
					}
				/>

				<Route element={<ProtectedClientPage />}>
					<Route
						path="/room"
						element={<StudentRoomView />}
					/>
					<Route
						path="/scoreboard"
						element={
							<RoomScoreboardView
								roomCode="582991"
								questionNumber={8}
								totalQuestions={20}
								players={sampleRoomPlayers}
							/>
						}
					/>
				</Route>
			</Routes>
		</>
	);
}

export default App;
