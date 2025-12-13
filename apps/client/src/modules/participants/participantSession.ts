export type ParticipantSession = {
	id: string;
	roomId: string;
	userId: string;
	nickname: string;
	expiresAt: string;
};

const KEY = "qb_participant_session";

export const saveParticipantSession = (session: ParticipantSession) =>
	localStorage.setItem(KEY, JSON.stringify(session));

export const loadParticipantSession = (): ParticipantSession | null => {
	const raw = localStorage.getItem(KEY);
	return raw ? (JSON.parse(raw) as ParticipantSession) : null;
};

export const clearParticipantSession = () => localStorage.removeItem(KEY);
