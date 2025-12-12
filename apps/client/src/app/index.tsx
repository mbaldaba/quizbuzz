import { Navigate, Route, Routes } from "react-router-dom";

import StudentJoinView from "@/features/participants/StudentJoinView";
import StudentRoomView from "@/features/participants/StudentRoomView";
import ParticipantRoute from "@/features/participants/ParticipantRoute";

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
