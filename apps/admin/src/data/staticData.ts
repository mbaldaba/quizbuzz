import { ActiveRoomEnum, IActiveRoom, IPlayer, IQuestionData, QuestionType } from "../common/types";

export const mockActiveRooms: IActiveRoom[] = [
	{
		id: 1,
		roomNumber: "YH82",
		title: "Regional Science Quiz Bee Elimination Round",
		hostName: "Teacher Jessa",
		status: ActiveRoomEnum.WAITING,
		players: 4,
		maxPlayers: 20,
		requiresPassword: true,
		password: "science123",
		createdAt: "2024-01-15T10:00:00Z",
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
		password: "brains2024",
		createdAt: "2024-01-15T09:30:00Z",
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
		password: "techquiz",
		createdAt: "2024-01-15T08:00:00Z",
	},
];

export const mockPlayers: IPlayer[] = [
	{ id: "1", name: "John Doe", team: "Team Alpha", joinedAt: "2024-01-15T10:05:00Z", score: 0 },
	{ id: "2", name: "Jane Smith", team: "Team Beta", joinedAt: "2024-01-15T10:06:00Z", score: 0 },
	{ id: "3", name: "Bob Johnson", team: "Team Alpha", joinedAt: "2024-01-15T10:07:00Z", score: 0 },
	{ id: "4", name: "Alice Williams", team: "Team Gamma", joinedAt: "2024-01-15T10:08:00Z", score: 0 },
];

export const mockQuestions: IQuestionData[] = [
	{
		id: "1",
		type: QuestionType.multiple_choice,
		text: "What is the capital of France?",
		choices: [
			{ id: "a", label: "A", text: "London" },
			{ id: "b", label: "B", text: "Berlin" },
			{ id: "c", label: "C", text: "Paris" },
			{ id: "d", label: "D", text: "Madrid" },
		],
		correctAnswer: "c",
	},
	{
		id: "2",
		type: QuestionType.true_false,
		text: "The Earth is flat.",
		correctAnswer: "false",
	},
	{
		id: "3",
		type: QuestionType.identification,
		text: "What is the largest planet in our solar system?",
		correctAnswer: "Jupiter",
	},
];

