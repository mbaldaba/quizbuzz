export enum ActiveRoomEnum {
  WAITING = "Waiting for players",
  ONGOING = "Ongoing",
}

export enum QuestionType {
	multiple_choice = "Multiple Choice",
	true_false = "True or False",
	identification = "Identification",
}

export type Phase = "buzz" | "answer" | "waiting";

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
};

export interface IActiveRoom {
	id: number,
	roomNumber: string,
	title: string,
	hostName: string,
	status: ActiveRoomEnum,
	players: number,
	maxPlayers?: number,
	requiresPassword: boolean,
}

export interface IUser {
	name: string,
	team: string,
}