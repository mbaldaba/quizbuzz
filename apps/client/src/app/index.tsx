import { Navigate, Route, Routes } from "react-router-dom";

import ParticipantRoute from "@/features/participants/ParticipantRoute";
import ScoreboardView from "@/features/participants/ScoreboardView";
import StudentJoinView from "@/features/participants/StudentJoinView";
import StudentRoomView from "@/features/participants/StudentRoomView";

function App() {
	return (
		<Routes>
			<Route
				path="/"
				element={<StudentJoinView />}
			/>

			<Route element={<ParticipantRoute />}>
				<Route
					path="/room/:roomId"
					element={<StudentRoomView />}
				/>
				<Route
					path="/room/:roomId/leaderboard"
					element={<ScoreboardView />}
				/>
			</Route>

			<Route
				path="*"
				element={
					<Navigate
						to="/"
						replace
					/>
				}
			/>
		</Routes>
	);
}

export default App;
