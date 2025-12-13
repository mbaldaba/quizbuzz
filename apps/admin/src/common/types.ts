export enum ActiveRoomEnum {
  WAITING = "Waiting for players",
  ONGOING = "Ongoing",
  ENDED = "Ended",
}

export enum QuestionType {
	multiple_choice = "Multiple Choice",
	true_false = "True or False",
	identification = "Identification",
}

export interface IChoice {
	id: string,
	label: string,
	text: string,
};

export interface IQuestionData {
	id: string,
	type: QuestionType,
	text: string,
	choices?: IChoice[],
	correctAnswer?: string,
};

export interface IActiveRoom {
	id: string, // Changed to string to match API IDs
	roomNumber: string,
	title: string,
	hostName: string,
	status: ActiveRoomEnum,
	players: number,
	maxPlayers?: number,
	requiresPassword: boolean,
	password?: string | null,
	createdAt: string,
	questions?: IQuestionData[],
}

export interface IPlayer {
	id: string,
	name: string,
	team?: string,
	joinedAt: string,
	score?: number,
}

