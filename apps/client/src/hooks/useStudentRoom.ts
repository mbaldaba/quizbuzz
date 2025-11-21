import { useState } from "react";
import { IQuestionData, Phase } from "../common/types";

export function useStudentRoom() {
	// Basic identity / room metadata
	const [playerName] = useState<string>("Player 1");
	const [roomCode] = useState<string>("123456");

	// Question progress
	const [questionNumber] = useState<number>(1);
	const [totalQuestions] = useState<number | undefined>(10);

	// Phase & timers
	const [phase] = useState<Phase>("buzz"); // "buzz" | "answer" | "waiting" (depending on your Phase type)
	const [timeRemaining] = useState<number>(10);

	// Fixed durations (seconds)
	const buzzDuration = 10;
	const answerDuration = 15;

	// Question data (start with null until server sends one)
	const [question] = useState<IQuestionData | null>(null);

	// Current responder info
	const [currentResponderName] = useState<string | null>(null);

	// Buzz state for this player
	const [isBuzzLocked] = useState<boolean>(false);
	const [hasBuzzed] = useState<boolean>(false);

	// Selected choice id (kept for compatibility, even if you’re using text questions only)
	const [selectedChoiceId] = useState<string | null>(null);

	return {
		playerName,
		roomCode,
		questionNumber,
		totalQuestions,

		phase,
		timeRemaining,
		buzzDuration,
		answerDuration,

		question,
		currentResponderName,

		isBuzzLocked,
		hasBuzzed,

		selectedChoiceId,
	};
}
