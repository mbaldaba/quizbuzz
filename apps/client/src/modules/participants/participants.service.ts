import { api } from "@/app/apiClient";
import {
	setParticipantToken,
	removeParticipantToken,
} from "@/common/helpers";
import {
	saveParticipantSession,
	clearParticipantSession,
	ParticipantSession,
} from "./participantSession";

export type JoinParticipantResponse = ParticipantSession & {
	token: string;
};

export const joinRoomAsParticipant = async (payload: {
	roomId: string;
	nickname: string;
	password?: string;
}) => {
	const res = await api.post<JoinParticipantResponse>(
		"/participants/join",
		payload
	);

	setParticipantToken(res.data.token);

	// ✅ store reusable info (nickname, roomId, etc.)
	const { token, ...session } = res.data;
	saveParticipantSession(session);

	return res.data;
};

export const leaveRoomAsParticipant = async () => {
	try {
		await api.post("/participants/leave");
	} finally {
		removeParticipantToken();
		clearParticipantSession();
	}
};
