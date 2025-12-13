import { useEffect, useState } from "react";
import {
	loadParticipantSession,
	ParticipantSession,
} from "./participantSession";

export const useParticipantSession = () => {
	const [session, setSession] = useState<ParticipantSession | null>(null);

	useEffect(() => {
		setSession(loadParticipantSession());
	}, []);

	return session;
};
