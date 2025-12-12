export function getParticipantToken(): string | null {
	return window.localStorage.getItem("qb_participant_token");
}

export function setParticipantToken(token: string): void {
	window.localStorage.setItem("qb_participant_token", token);
}

export function removeParticipantToken(): void {
	window.localStorage.removeItem("qb_participant_token");
}