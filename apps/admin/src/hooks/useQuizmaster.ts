import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	nextQuestion,
	revealAnswer,
	mapNextQuestionResponseToQuestion,
	getQuestion,
	mapQuestionFromApi,
	type NextQuestionResponse,
	type RevealAnswerResponse,
} from "../common/api";
import { IQuestionData } from "../common/types";

// Query keys for React Query
export const quizmasterKeys = {
	all: ["quizmaster"] as const,
	room: (roomId: string) => [...quizmasterKeys.all, "room", roomId] as const,
	currentQuestion: (roomId: string) => [...quizmasterKeys.room(roomId), "currentQuestion"] as const,
};

/**
 * Hook for getting the next question mutation
 * Handles next question API call and updates the current question
 */
export function useNextQuestion() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (roomId: string) => nextQuestion(roomId),
		onSuccess: (response: NextQuestionResponse, roomId: string) => {
			// Map the response to frontend format
			const mappedQuestion = mapNextQuestionResponseToQuestion(response);
			
			// Update the current question in the cache
			queryClient.setQueryData<IQuestionData>(
				quizmasterKeys.currentQuestion(roomId),
				mappedQuestion
			);
			
			toast.success("Next question loaded");
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Failed to get next question";
			toast.error(errorMessage);
		},
	});
}

/**
 * Hook for revealing the answer mutation
 * Handles reveal answer API call and fetches the full question with correct answer
 */
export function useRevealAnswer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ roomId, questionId }: { roomId: string; questionId: string }) =>
			revealAnswer(roomId, questionId),
		onSuccess: async (response: RevealAnswerResponse, variables) => {
			const { roomId, questionId } = variables;
			
			// Fetch the full question to get the correct answer
			try {
				const fullQuestion = await getQuestion(questionId);
				const mappedQuestion = mapQuestionFromApi(fullQuestion);
				
				// Update the current question in the cache with the full question data
				queryClient.setQueryData<IQuestionData>(
					quizmasterKeys.currentQuestion(roomId),
					mappedQuestion
				);
				
				toast.success("Answer revealed");
			} catch (error) {
				console.error("Failed to fetch full question:", error);
				toast.error("Answer revealed but failed to load full question details");
			}
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Failed to reveal answer";
			toast.error(errorMessage);
		},
	});
}

/**
 * Hook to get the current question for a room
 * Uses React Query to cache and reactively read the current question
 */
export function useCurrentQuestion(roomId: string | null) {
	const queryClient = useQueryClient();
	
	return useQuery<IQuestionData | null>({
		queryKey: roomId ? quizmasterKeys.currentQuestion(roomId) : ["quizmaster", "no-room"],
		queryFn: () => {
			// Read from cache
			return queryClient.getQueryData<IQuestionData>(
				roomId ? quizmasterKeys.currentQuestion(roomId) : ["quizmaster", "no-room"]
			) || null;
		},
		enabled: !!roomId,
		initialData: null,
		staleTime: Infinity, // Cache data never goes stale
		gcTime: Infinity, // Never garbage collect
	});
}
