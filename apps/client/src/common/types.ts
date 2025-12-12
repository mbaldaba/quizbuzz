export enum ActiveRoomEnum {
	WAITING = "Waiting for players",
	ONGOING = "Ongoing",
}

export enum QuestionTypeLabel {
	multiple_choice = "Multiple Choice",
	true_false = "True or False",
	identification = "Identification",
}

export type Phase = "buzz" | "answer" | "waiting";

export interface IChoice {
	id: string;
	value?: string;
	label?: string;
	text?: string;
}

export interface IQuestionData {
	id: string;
	type: QuestionTypeLabel | WSQuestionType;
	text?: string;
	description?: string;
	choices?: IChoice[];
	questionNumber?: number;
}

export interface IActiveRoom {
	id: number;
	roomNumber: string;
	title: string;
	hostName: string;
	status: ActiveRoomEnum;
	players: number;
	maxPlayers?: number;
	requiresPassword: boolean;
}

export interface IUser {
	name: string;
	team: string;
}

export interface IPlayerScore {
	id: string;
	name: string;
	score: number;
	correctAnswers?: number;
	wrongAnswers?: number;
	isYou?: boolean;
}

export const SOCKET_EVENTS = {
	JOIN_ROOM: "JOIN_ROOM",
	LEAVE_ROOM: "LEAVE_ROOM",
	ROOM_JOINED: "ROOM_JOINED",
	PARTICIPANT_JOINED: "PARTICIPANT_JOINED",
	PARTICIPANT_LEFT: "PARTICIPANT_LEFT",
	SUBMIT_ANSWER: "SUBMIT_ANSWER",
	ANSWER_SUBMITTED: "ANSWER_SUBMITTED",
	NEXT_QUESTION: "NEXT_QUESTION",
	ANSWER_REVEALED: "ANSWER_REVEALED",
	SCORES_UPDATE: "SCORES_UPDATE",
	QUIZ_STARTED: "QUIZ_STARTED",
	QUIZ_ENDED: "QUIZ_ENDED",
	ERROR: "ERROR",
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export type WSQuestionType =
	| "MULTIPLE_CHOICE"
	| "TRUE_OR_FALSE"
	| "IDENTIFICATION";

export interface WSChoice {
	id: string;
	value: string;
}

export interface JoinRoomPayload {
	roomId: string;
	token: string;
}

export interface LeaveRoomPayload {
	roomId: string;
}

export interface SubmitAnswerPayload {
	questionId: string;
	answerId?: string;
	answerText?: string;
}

export interface RoomJoinedPayload {
	participantId: string;
	nickname: string;
	roomId: string;
}

export interface ParticipantJoinedPayload {
	participantId: string;
	nickname: string;
}

export interface ParticipantLeftPayload {
	participantId: string;
	nickname: string;
}

export interface AnswerSubmittedPayload {
	questionId: string;
	accepted: boolean;
}

export interface ErrorPayload {
	message: string;
	code: string;
}

export interface NextQuestionPayload {
	questionId: string;
	type: WSQuestionType;
	description: string;
	choices?: WSChoice[];
	questionNumber: number;
}

export interface AnswerRevealedPayload {
	questionId: string;
	correctAnswerId?: string;
	correctAnswerText?: string;
	correctAnswerValue: string;
	firstCorrectParticipant?: { participantId: string; nickname: string };
}

export interface ParticipantScore {
	participantId: string;
	nickname: string;
	answeredCorrectly: boolean;
	pointsEarned: number;
	totalScore: number;
}

export interface ScoresUpdatePayload {
	questionId: string;
	scores: ParticipantScore[];
}

export interface QuizStartedPayload {
	roomId: string;
	startedAt: string; // ISO string
}

export interface QuizEndedPayload {
	roomId: string;
	endedAt: string; // ISO string
}

export interface ServerToClientEvents {
	ROOM_JOINED: (payload: RoomJoinedPayload) => void;
	PARTICIPANT_JOINED: (payload: ParticipantJoinedPayload) => void;
	PARTICIPANT_LEFT: (payload: ParticipantLeftPayload) => void;
	NEXT_QUESTION: (payload: NextQuestionPayload) => void;
	ANSWER_REVEALED: (payload: AnswerRevealedPayload) => void;
	SCORES_UPDATE: (payload: ScoresUpdatePayload) => void;
	QUIZ_STARTED: (payload: QuizStartedPayload) => void;
	QUIZ_ENDED: (payload: QuizEndedPayload) => void;
	ANSWER_SUBMITTED: (payload: AnswerSubmittedPayload) => void;
	ERROR: (payload: ErrorPayload) => void;
}

export interface ClientToServerEvents {
	JOIN_ROOM: (payload: JoinRoomPayload) => void;
	LEAVE_ROOM: (payload: LeaveRoomPayload) => void;
	SUBMIT_ANSWER: (payload: SubmitAnswerPayload) => void;
}
