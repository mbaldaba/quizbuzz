import { QuestionType, IQuestionData, IChoice } from "./types";

const API_BASE_URL = "http://localhost:4242";

export interface SessionResponse {
	id: string;
	username: string;
	type: string;
	sessionId: string;
	expiresAt: string;
}

export interface AdminAccount {
	username: string;
	email?: string;
	role?: string;
	createdAt?: string;
}

export interface AccountsResponse {
	success: boolean;
	accounts: AdminAccount[];
	count: number;
}

export interface ApiError {
	success: false;
	message: string;
}

export async function login(
	username: string,
	password: string
): Promise<SessionResponse> {
	const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify({ username, password }),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Login failed" }));
		throw new Error(error.message || "Login failed");
	}

	return response.json();
}

export async function getSession(): Promise<SessionResponse> {
	const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Not authenticated");
	}

	return response.json();
}

export async function logout(): Promise<void> {
	try {
		const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
			method: "POST",
			credentials: "include",
		});

		// Even if the response is not ok, we consider logout successful
		// because the cookie will be cleared on the client side
		if (!response.ok && response.status !== 401) {
			// Only throw for non-auth errors (network issues, etc.)
			const error = await response.json().catch(() => ({ message: "Logout failed" }));
			throw new Error(error.message || "Logout failed");
		}
	} catch (error) {
		// If it's a network error, we still want to clear local state
		// Only re-throw if it's a non-network error
		if (error instanceof TypeError) {
			// Network error - still consider logout successful for local state
			return;
		}
		throw error;
	}
}

export async function getAccounts(): Promise<AccountsResponse> {
	const response = await fetch(`${API_BASE_URL}/api/auth/accounts`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to fetch accounts" }));
		throw new Error(error.message || "Failed to fetch accounts");
	}

	return response.json();
}

// ============================================================================
// Questions API
// ============================================================================

export enum ApiQuestionType {
	MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
	TRUE_OR_FALSE = "TRUE_OR_FALSE",
	IDENTIFICATION = "IDENTIFICATION",
}

export interface ApiQuestionChoice {
	id: string;
	value: string;
	isCorrect: boolean;
}

export interface ApiQuestion {
	id: string;
	type: ApiQuestionType;
	description: string;
	choices: ApiQuestionChoice[];
	createdAt: string;
	updatedAt: string;
	createdBy: {
		id: string;
		username: string;
	};
	updatedBy: {
		id: string;
		username: string;
	};
}

export interface PaginatedQuestionsResponse {
	data: ApiQuestion[];
	meta: {
		page: number;
		perPage: number;
		total: number;
		totalPages: number;
	};
}

export interface CreateQuestionRequest {
	type: ApiQuestionType;
	description: string;
	choices: Array<{
		value: string;
		isCorrect?: boolean;
	}>;
}

export interface UpdateQuestionRequest {
	type?: ApiQuestionType;
	description?: string;
	choices?: Array<{
		value: string;
		isCorrect?: boolean;
	}>;
}

export async function getQuestions(params?: {
	page?: number;
	perPage?: number;
	type?: ApiQuestionType;
	search?: string;
}): Promise<PaginatedQuestionsResponse> {
	const queryParams = new URLSearchParams();
	if (params?.page) queryParams.append("page", params.page.toString());
	if (params?.perPage) queryParams.append("perPage", params.perPage.toString());
	if (params?.type) queryParams.append("type", params.type);
	if (params?.search) queryParams.append("search", params.search);

	const url = `${API_BASE_URL}/api/questions${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to fetch questions" }));
		throw new Error(error.message || "Failed to fetch questions");
	}

	return response.json();
}

export async function getQuestion(id: string): Promise<ApiQuestion> {
	const response = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to fetch question" }));
		throw new Error(error.message || "Failed to fetch question");
	}

	return response.json();
}

export async function createQuestion(
	question: CreateQuestionRequest
): Promise<ApiQuestion> {
	const response = await fetch(`${API_BASE_URL}/api/questions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(question),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to create question" }));
		throw new Error(error.message || "Failed to create question");
	}

	return response.json();
}

export async function updateQuestion(
	id: string,
	question: UpdateQuestionRequest
): Promise<ApiQuestion> {
	const response = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(question),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to update question" }));
		throw new Error(error.message || "Failed to update question");
	}

	return response.json();
}

export async function deleteQuestion(id: string): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to delete question" }));
		throw new Error(error.message || "Failed to delete question");
	}
}

// ============================================================================
// Question Format Mapping Utilities
// ============================================================================

/**
 * Convert frontend QuestionType to API QuestionType
 */
export function mapQuestionTypeToApi(type: QuestionType): ApiQuestionType {
	switch (type) {
		case QuestionType.multiple_choice:
			return ApiQuestionType.MULTIPLE_CHOICE;
		case QuestionType.true_false:
			return ApiQuestionType.TRUE_OR_FALSE;
		case QuestionType.identification:
			return ApiQuestionType.IDENTIFICATION;
		default:
			throw new Error(`Unknown question type: ${type}`);
	}
}

/**
 * Convert API QuestionType to frontend QuestionType
 */
export function mapQuestionTypeFromApi(type: ApiQuestionType): QuestionType {
	switch (type) {
		case ApiQuestionType.MULTIPLE_CHOICE:
			return QuestionType.multiple_choice;
		case ApiQuestionType.TRUE_OR_FALSE:
			return QuestionType.true_false;
		case ApiQuestionType.IDENTIFICATION:
			return QuestionType.identification;
		default:
			throw new Error(`Unknown API question type: ${type}`);
	}
}

/**
 * Convert frontend IQuestionData to API CreateQuestionRequest
 */
export function mapQuestionToApiCreate(
	question: Omit<IQuestionData, "id">
): CreateQuestionRequest {
	const apiType = mapQuestionTypeToApi(question.type);
	
	// Handle different question types
	if (question.type === QuestionType.multiple_choice && question.choices) {
		// Multiple choice: all choices with isCorrect flag
		return {
			type: apiType,
			description: question.text,
			choices: question.choices.map((choice) => ({
				value: choice.text,
				isCorrect: question.correctAnswer === choice.id,
			})),
		};
	} else if (question.type === QuestionType.true_false) {
		// True/False: two choices (True and False)
		return {
			type: apiType,
			description: question.text,
			choices: [
				{ value: "True", isCorrect: question.correctAnswer === "true" },
				{ value: "False", isCorrect: question.correctAnswer === "false" },
			],
		};
	} else if (question.type === QuestionType.identification) {
		// Identification: single choice with the correct answer
		return {
			type: apiType,
			description: question.text,
			choices: [
				{
					value: question.correctAnswer || "",
					isCorrect: true,
				},
			],
		};
	}
	
	throw new Error(`Invalid question type or missing required data: ${question.type}`);
}

/**
 * Convert frontend IQuestionData to API UpdateQuestionRequest
 */
export function mapQuestionToApiUpdate(
	question: Omit<IQuestionData, "id">
): UpdateQuestionRequest {
	const apiType = mapQuestionTypeToApi(question.type);
	
	// Handle different question types
	if (question.type === QuestionType.multiple_choice && question.choices) {
		return {
			type: apiType,
			description: question.text,
			choices: question.choices.map((choice) => ({
				value: choice.text,
				isCorrect: question.correctAnswer === choice.id,
			})),
		};
	} else if (question.type === QuestionType.true_false) {
		return {
			type: apiType,
			description: question.text,
			choices: [
				{ value: "True", isCorrect: question.correctAnswer === "true" },
				{ value: "False", isCorrect: question.correctAnswer === "false" },
			],
		};
	} else if (question.type === QuestionType.identification) {
		return {
			type: apiType,
			description: question.text,
			choices: [
				{
					value: question.correctAnswer || "",
					isCorrect: true,
				},
			],
		};
	}
	
	throw new Error(`Invalid question type or missing required data: ${question.type}`);
}

/**
 * Convert API ApiQuestion to frontend IQuestionData
 */
export function mapQuestionFromApi(apiQuestion: ApiQuestion): IQuestionData {
	const frontendType = mapQuestionTypeFromApi(apiQuestion.type);
	
	// Convert choices based on question type
	let choices: IChoice[] | undefined;
	let correctAnswer: string | undefined;
	
	if (apiQuestion.type === ApiQuestionType.MULTIPLE_CHOICE) {
		// Multiple choice: convert to frontend format with id, label, text
		choices = apiQuestion.choices.map((choice, index) => {
			const labels = ["a", "b", "c", "d"];
			return {
				id: choice.id,
				label: labels[index]?.toUpperCase() || String.fromCharCode(65 + index),
				text: choice.value,
			};
		});
		// Find the correct answer choice id
		const correctChoice = apiQuestion.choices.find((c) => c.isCorrect);
		correctAnswer = correctChoice?.id;
	} else if (apiQuestion.type === ApiQuestionType.TRUE_OR_FALSE) {
		// True/False: find the correct answer
		const correctChoice = apiQuestion.choices.find((c) => c.isCorrect);
		correctAnswer = correctChoice?.value.toLowerCase();
	} else if (apiQuestion.type === ApiQuestionType.IDENTIFICATION) {
		// Identification: the correct answer is the value of the choice
		const correctChoice = apiQuestion.choices.find((c) => c.isCorrect);
		correctAnswer = correctChoice?.value;
	}
	
	return {
		id: apiQuestion.id,
		type: frontendType,
		text: apiQuestion.description,
		choices,
		correctAnswer,
	};
}

// ============================================================================
// Rooms API
// ============================================================================

export type ApiRoomStatus = "CREATED" | "ONGOING" | "ENDED";

export interface ApiRoom {
	id: string;
	title: string;
	maxPlayers: number;
	status: ApiRoomStatus;
	hasPassword: boolean;
	startedAt: string | null;
	endedAt: string | null;
	createdById: string;
	createdAt: string;
	updatedAt: string;
	questions?: Array<{
		id: string;
		type: "MULTIPLE_CHOICE" | "TRUE_OR_FALSE" | "IDENTIFICATION";
		description: string;
		choices: Array<{
			id: string;
			value: string;
		}>;
	}>;
}

export interface PaginatedRoomsResponse {
	data: ApiRoom[];
	meta: {
		page: number;
		perPage: number;
		total: number;
		totalPages: number;
	};
}

export interface CreateRoomRequest {
	title: string;
	maxPlayers: number;
	password?: string;
}

export async function getRooms(params?: {
	page?: number;
	perPage?: number;
}): Promise<PaginatedRoomsResponse> {
	const queryParams = new URLSearchParams();
	if (params?.page) queryParams.append("page", params.page.toString());
	if (params?.perPage) queryParams.append("perPage", params.perPage.toString());

	const url = `${API_BASE_URL}/api/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to fetch rooms" }));
		throw new Error(error.message || "Failed to fetch rooms");
	}

	return response.json();
}

export async function getRoomById(roomId: string): Promise<ApiRoom> {
	const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to fetch room" }));
		throw new Error(error.message || "Failed to fetch room");
	}

	return response.json();
}

export async function createRoom(
	room: CreateRoomRequest
): Promise<ApiRoom> {
	const response = await fetch(`${API_BASE_URL}/api/rooms`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(room),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to create room" }));
		throw new Error(error.message || "Failed to create room");
	}

	return response.json();
}

export async function deleteRoom(id: string): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to delete room" }));
		throw new Error(error.message || "Failed to delete room");
	}
}

export async function startRoom(id: string): Promise<ApiRoom> {
	const response = await fetch(`${API_BASE_URL}/api/rooms/${id}/start`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to start room" }));
		throw new Error(error.message || "Failed to start room");
	}

	return response.json();
}

export async function endRoom(id: string): Promise<ApiRoom> {
	const response = await fetch(`${API_BASE_URL}/api/rooms/${id}/end`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to end room" }));
		throw new Error(error.message || "Failed to end room");
	}

	return response.json();
}

// ============================================================================
// Quizmaster API
// ============================================================================

export interface NextQuestionResponse {
	id: string;
	type: "MULTIPLE_CHOICE" | "TRUE_OR_FALSE" | "IDENTIFICATION";
	description: string;
	choices: Array<{
		id: string;
		value: string;
	}>;
	roomId: string;
	roomQuestionId: string;
}

export interface RevealAnswerResponse {
	questionId: string;
	revealed: boolean;
	message: string;
}

export async function nextQuestion(roomId: string): Promise<NextQuestionResponse> {
	const response = await fetch(`${API_BASE_URL}/api/quizmaster/next-question`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify({ roomId }),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to get next question" }));
		throw new Error(error.message || "Failed to get next question");
	}

	return response.json();
}

export async function revealAnswer(roomId: string, questionId: string): Promise<RevealAnswerResponse> {
	const response = await fetch(`${API_BASE_URL}/api/quizmaster/reveal-answer`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify({ roomId, questionId }),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to reveal answer" }));
		throw new Error(error.message || "Failed to reveal answer");
	}

	return response.json();
}

/**
 * Convert NextQuestionResponse to frontend IQuestionData
 */
export function mapNextQuestionResponseToQuestion(response: NextQuestionResponse): IQuestionData {
	// Convert NextQuestionResponse to ApiQuestion format
	const apiType = response.type === "MULTIPLE_CHOICE" 
		? ApiQuestionType.MULTIPLE_CHOICE 
		: response.type === "TRUE_OR_FALSE"
		? ApiQuestionType.TRUE_OR_FALSE
		: ApiQuestionType.IDENTIFICATION;
	
	// Convert choices to ApiQuestionChoice format (add isCorrect: false for now, will be revealed later)
	const apiChoices: ApiQuestionChoice[] = response.choices.map(choice => ({
		id: choice.id,
		value: choice.value,
		isCorrect: false, // Not revealed in next question response
	}));
	
	const apiQuestion: ApiQuestion = {
		id: response.id,
		type: apiType,
		description: response.description,
		choices: apiChoices,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		createdBy: { id: "", username: "" },
		updatedBy: { id: "", username: "" },
	};
	
	return mapQuestionFromApi(apiQuestion);
}

// ============================================================================
// Room Format Mapping Utilities
// ============================================================================

import { IActiveRoom, ActiveRoomEnum } from "./types";

/**
 * Generate a short room number from room ID
 */
function generateRoomNumberFromId(id: string): string {
	// Use first 4 characters of the ID, converting to uppercase
	// If ID is shorter, pad with random chars
	if (id.length >= 4) {
		return id.substring(0, 4).toUpperCase();
	}
	// Fallback: use a hash-like approach
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = id.toUpperCase().substring(0, id.length);
	while (result.length < 4) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result.substring(0, 4);
}

/**
 * Convert API RoomStatus to frontend ActiveRoomEnum
 */
export function mapRoomStatusFromApi(status: ApiRoomStatus): ActiveRoomEnum {
	switch (status) {
		case "CREATED":
			return ActiveRoomEnum.WAITING;
		case "ONGOING":
			return ActiveRoomEnum.ONGOING;
		case "ENDED":
			return ActiveRoomEnum.ENDED;
		default:
			return ActiveRoomEnum.WAITING;
	}
}

/**
 * Convert frontend ActiveRoomEnum to API RoomStatus
 */
export function mapRoomStatusToApi(status: ActiveRoomEnum): ApiRoomStatus {
	switch (status) {
		case ActiveRoomEnum.WAITING:
			return "CREATED";
		case ActiveRoomEnum.ONGOING:
			return "ONGOING";
		case ActiveRoomEnum.ENDED:
			return "ENDED";
		default:
			return "CREATED";
	}
}

/**
 * Convert API ApiRoom to frontend IActiveRoom
 */
export function mapRoomFromApi(apiRoom: ApiRoom, hostName: string = "You"): IActiveRoom {
	return {
		id: apiRoom.id, // Keep original API ID as string
		roomNumber: generateRoomNumberFromId(apiRoom.id),
		title: apiRoom.title,
		hostName,
		status: mapRoomStatusFromApi(apiRoom.status),
		players: 0, // TODO: Fetch actual player count from participants API
		maxPlayers: apiRoom.maxPlayers,
		requiresPassword: apiRoom.hasPassword,
		password: null, // Password is not returned from API for security
		createdAt: apiRoom.createdAt,
		questions: apiRoom.questions?.map(q => {
			// Convert API question format to frontend format
			const apiQuestion: ApiQuestion = {
				id: q.id,
				type: q.type === "MULTIPLE_CHOICE" 
					? ApiQuestionType.MULTIPLE_CHOICE 
					: q.type === "TRUE_OR_FALSE"
					? ApiQuestionType.TRUE_OR_FALSE
					: ApiQuestionType.IDENTIFICATION,
				description: q.description,
				choices: q.choices.map(c => ({
					id: c.id,
					value: c.value,
					isCorrect: false, // Not included in room response for security
				})),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				createdBy: { id: "", username: "" },
				updatedBy: { id: "", username: "" },
			};
			return mapQuestionFromApi(apiQuestion);
		}),
	};
}

/**
 * Convert frontend room data to API CreateRoomRequest
 */
export function mapRoomToApiCreate(roomData: {
	title: string;
	maxPlayers?: number;
	requiresPassword: boolean;
	password?: string;
}): CreateRoomRequest {
	return {
		title: roomData.title,
		maxPlayers: roomData.maxPlayers || 10, // Default to 10 if not specified
		password: roomData.requiresPassword ? roomData.password : undefined,
	};
}

