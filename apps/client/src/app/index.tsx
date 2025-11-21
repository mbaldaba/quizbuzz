import { Route, Routes, useNavigate } from "react-router-dom";
import StudentJoinView from "../components/StudentJoinView";
import { activeRoomsFromServer } from "../data/staticData";
import ProtectedClientPage from "../components/ProtectedClientPage";
import StudentRoomView from "../components/StudentRoomView";
import { setToken } from "../common/helpers";

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
				</Route>
			</Routes>
		</>
	);
}

export default App;
