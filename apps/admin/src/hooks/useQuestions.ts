import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	client,
	type QuestionResponseDto,
	type CreateQuestionDto,
	type UpdateQuestionDto,
	type PaginatedQuestionsResponseDto,
} from "@repo/api-client";
import { IQuestionData, QuestionType, IChoice } from "../common/types";
import { useSession } from "./useAuth";

// Query keys for React Query
export const questionKeys = {
	all: ["questions"] as const,
	lists: () => [...questionKeys.all, "list"] as const,
	list: (params?: { perPage?: number }) => [...questionKeys.lists(), params] as const,
};

/**
 * Convert API question type to frontend QuestionType
 */
function mapQuestionTypeFromApi(
	type: "MULTIPLE_CHOICE" | "TRUE_OR_FALSE" | "IDENTIFICATION"
): QuestionType {
	switch (type) {
		case "MULTIPLE_CHOICE":
			return QuestionType.multiple_choice;
		case "TRUE_OR_FALSE":
			return QuestionType.true_false;
		case "IDENTIFICATION":
			return QuestionType.identification;
		default:
			return QuestionType.multiple_choice;
	}
}

/**
 * Convert frontend QuestionType to API question type
 */
function mapQuestionTypeToApi(type: QuestionType): "MULTIPLE_CHOICE" | "TRUE_OR_FALSE" | "IDENTIFICATION" {
	switch (type) {
		case QuestionType.multiple_choice:
			return "MULTIPLE_CHOICE";
		case QuestionType.true_false:
			return "TRUE_OR_FALSE";
		case QuestionType.identification:
			return "IDENTIFICATION";
		default:
			return "MULTIPLE_CHOICE";
	}
}

/**
 * Convert API QuestionResponseDto to frontend IQuestionData
 */
function mapQuestionFromApi(apiQuestion: QuestionResponseDto): IQuestionData {
	const frontendType = mapQuestionTypeFromApi(apiQuestion.type);
	
	// Convert choices based on question type
	let choices: IChoice[] | undefined;
	let correctAnswer: string | undefined;
	
	if (apiQuestion.type === "MULTIPLE_CHOICE") {
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
	} else if (apiQuestion.type === "TRUE_OR_FALSE") {
		// True/False: find the correct answer
		const correctChoice = apiQuestion.choices.find((c) => c.isCorrect);
		correctAnswer = correctChoice?.value.toLowerCase();
	} else if (apiQuestion.type === "IDENTIFICATION") {
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

/**
 * Convert frontend IQuestionData to API CreateQuestionDto
 */
function mapQuestionToApiCreate(question: Omit<IQuestionData, "id">): CreateQuestionDto {
	const apiType = mapQuestionTypeToApi(question.type);
	
	let choices: Array<{ value: string; isCorrect?: boolean }>;
	
	if (question.type === QuestionType.multiple_choice && question.choices) {
		// Multiple choice: map choices
		choices = question.choices.map((choice) => ({
			value: choice.text,
			isCorrect: question.correctAnswer === choice.id,
		}));
	} else if (question.type === QuestionType.true_false) {
		// True/False: create True and False choices
		choices = [
			{ value: "True", isCorrect: question.correctAnswer === "true" },
			{ value: "False", isCorrect: question.correctAnswer === "false" },
		];
	} else {
		// Identification: single choice with correct answer
		choices = [
			{
				value: question.correctAnswer || "",
				isCorrect: true,
			},
		];
	}
	
	return {
		type: apiType,
		description: question.text,
		choices,
	};
}

/**
 * Convert frontend IQuestionData to API UpdateQuestionDto
 */
function mapQuestionToApiUpdate(question: Omit<IQuestionData, "id">): UpdateQuestionDto {
	const apiType = mapQuestionTypeToApi(question.type);
	
	let choices: Array<{ value: string; isCorrect?: boolean }> | undefined;
	
	if (question.type === QuestionType.multiple_choice && question.choices) {
		// Multiple choice: map choices
		choices = question.choices.map((choice) => ({
			value: choice.text,
			isCorrect: question.correctAnswer === choice.id,
		}));
	} else if (question.type === QuestionType.true_false) {
		// True/False: create True and False choices
		choices = [
			{ value: "True", isCorrect: question.correctAnswer === "true" },
			{ value: "False", isCorrect: question.correctAnswer === "false" },
		];
	} else if (question.correctAnswer) {
		// Identification: single choice with correct answer
		choices = [
			{
				value: question.correctAnswer,
				isCorrect: true,
			},
		];
	}
	
	return {
		type: apiType,
		description: question.text,
		choices,
	};
}

/**
 * Hook to fetch questions
 * Uses React Query to cache and manage questions state
 */
export function useQuestions(params?: { perPage?: number }) {
	const { data: session } = useSession();

	return useQuery({
		queryKey: questionKeys.list(params),
		queryFn: async () => {
			const response = await client.get<{ 200: PaginatedQuestionsResponseDto }>({
				url: "/questions",
				query: { perPage: params?.perPage || 100 },
			});
			if (!response.data) {
				throw new Error("Failed to fetch questions");
			}
			// The response might be PaginatedQuestionsResponseDto or just an array
			let questionsData: QuestionResponseDto[];
			if (Array.isArray(response.data)) {
				questionsData = response.data as QuestionResponseDto[];
			} else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
				questionsData = (response.data as PaginatedQuestionsResponseDto).data;
			} else {
				questionsData = [];
			}
			return questionsData.map(mapQuestionFromApi);
		},
		enabled: !!session,
		staleTime: 1000 * 30, // 30 seconds
		refetchOnWindowFocus: false,
	});
}

/**
 * Hook for creating a question mutation
 * Handles question creation and invalidates questions query on success
 */
export function useCreateQuestion() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (question: Omit<IQuestionData, "id">) => {
			const apiQuestion = mapQuestionToApiCreate(question);
			const response = await client.post<{ 200: QuestionResponseDto }>({
				url: "/questions",
				body: apiQuestion,
			});
			if (!response.data) {
				throw new Error("Failed to create question");
			}
			return mapQuestionFromApi(response.data);
		},
		onSuccess: () => {
			// Invalidate and refetch questions after successful creation
			queryClient.invalidateQueries({ queryKey: questionKeys.all });
			toast.success("Question created successfully");
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Failed to create question";
			toast.error(errorMessage);
		},
	});
}

/**
 * Hook for updating a question mutation
 * Handles question update and invalidates questions query on success
 */
export function useUpdateQuestion() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			questionId,
			question,
		}: {
			questionId: string;
			question: Omit<IQuestionData, "id">;
		}) => {
			const apiQuestion = mapQuestionToApiUpdate(question);
			const response = await client.patch<{ 200: QuestionResponseDto }>({
				url: "/questions/{id}",
				path: { id: questionId },
				body: apiQuestion,
			});
			if (!response.data) {
				throw new Error("Failed to update question");
			}
			return mapQuestionFromApi(response.data);
		},
		onSuccess: () => {
			// Invalidate and refetch questions after successful update
			queryClient.invalidateQueries({ queryKey: questionKeys.all });
			toast.success("Question updated successfully");
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Failed to update question";
			toast.error(errorMessage);
		},
	});
}

/**
 * Hook for deleting a question mutation
 * Handles question deletion and invalidates questions query on success
 */
export function useDeleteQuestion() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (questionId: string) => {
			await client.delete({
				url: "/questions/{id}",
				path: { id: questionId },
			});
		},
		onSuccess: () => {
			// Invalidate and refetch questions after successful deletion
			queryClient.invalidateQueries({ queryKey: questionKeys.all });
			toast.success("Question deleted successfully");
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Failed to delete question";
			toast.error(errorMessage);
		},
	});
}
