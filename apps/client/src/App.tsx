import { ActiveRoomEnum } from "./common/types";
import StudentJoinView from "./components/StudentJoinView";

function App() {
  const activeRoomsFromServer = [
		{
			id: 1,
			roomNumber: "YH82",
			title: "Regional Science Quiz Bee Elimination Round",
			hostName: "Teacher Jessa",
			status: ActiveRoomEnum.WAITING,
			players: 4,
			maxPlayers: 20,
			requiresPassword: true,
		},
		{
			id: 2,
			roomNumber: "FD3W",
			title: "Battle of the Brains - Semi Finals",
			hostName: "Teacher Mae",
			status: ActiveRoomEnum.ONGOING,
			players: 18,
			maxPlayers: 20,
			requiresPassword: true,
		},
		{
			id: 3,
			roomNumber: "COM9",
			title: "Battle of the Computer Whiz",
			hostName: "Teacher Jam",
			status: ActiveRoomEnum.ONGOING,
			players: 16,
			maxPlayers: 16,
			requiresPassword: true,
		},
		{
			id: 4,
			roomNumber: "SAM2",
			title: "Quiz Participants Briefing",
			hostName: "Teacher Mon",
			status: ActiveRoomEnum.WAITING,
			players: 36,
			requiresPassword: false,
		},
		{
			id: 5,
			roomNumber: "FD3W",
			title: "Power Quiz: General Information Eliminations",
			hostName: "Teacher Raymond",
			status: ActiveRoomEnum.ONGOING,
			players: 72,
			requiresPassword: true,
		},
		{
			id: 6,
			roomNumber: "ARTS",
			title: "Philippine History Semis",
			hostName: "Teacher Rizal",
			status: ActiveRoomEnum.ONGOING,
			players: 28,
			maxPlayers: 30,
			requiresPassword: true,
		},
	];

  return (
		<>
			<StudentJoinView
				activeRooms={activeRoomsFromServer}
				onJoin={(roomNumber, password) => {
					// TODO: join endpoint here
				}}
			/>
		</>
	);
}

export default App;
