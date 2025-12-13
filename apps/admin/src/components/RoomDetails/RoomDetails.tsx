import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { IActiveRoom, IPlayer, IQuestionData, QuestionType } from "../../common/types";
import { getRoomById, type ApiRoomDetails, type ApiRoomQuestion } from "../../common/api";
import styles from "./RoomDetails.module.scss";

type RoomDetailsProps = {
	room: IActiveRoom;
	players: IPlayer[];
	questions: IQuestionData[];
	onClose: () => void;
};

// Union type to handle both API and local question formats
type QuestionDisplay = IQuestionData | ApiRoomQuestion;
type ChoiceDisplay = { id: string; label?: string; text?: string; value?: string; isCorrect?: boolean };

export default function RoomDetails({
	room,
	players,
	questions,
	onClose,
}: RoomDetailsProps) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
	const [showAnswer, setShowAnswer] = useState<boolean>(false);
	const [roomDetails, setRoomDetails] = useState<ApiRoomDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch room details by ID when modal is opened
	useEffect(() => {
		const fetchRoomDetails = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const details = await getRoomById(room.id);
				setRoomDetails(details);
			} catch (err) {
				console.error("Failed to fetch room details:", err);
				const errorMessage = err instanceof Error ? err.message : "Failed to load room details";
				setError(errorMessage);
			} finally {
				setIsLoading(false);
			}
		};

		fetchRoomDetails();
	}, [room.id]);

	// Use questions from API if available, otherwise fallback to props
	const apiQuestions = roomDetails?.questions || [];
	const displayQuestions = apiQuestions.length > 0 ? apiQuestions : questions;
	
	const currentQuestion = displayQuestions[currentQuestionIndex];
	const isLastQuestion = currentQuestionIndex === displayQuestions.length - 1;

	const handleNext = () => {
		if (!showAnswer) {
			// Show answer first
			setShowAnswer(true);
		} else {
			// Move to next question
			if (!isLastQuestion) {
				setCurrentQuestionIndex(currentQuestionIndex + 1);
				setShowAnswer(false);
			}
		}
	};

	const getAnswerDisplay = (question: QuestionDisplay): string => {
		// Handle API response format (ApiRoomQuestion)
		if ('correctAnswerId' in question && question.correctAnswerId) {
			const choice = question.choices?.find((c) => c.id === question.correctAnswerId);
			return choice ? choice.value : "No answer provided";
		}
		
		// Handle local format (IQuestionData)
		if ('correctAnswer' in question && !question.correctAnswer) return "No answer provided";
		
		if ('correctAnswer' in question && question.type === QuestionType.multiple_choice) {
			const choice = question.choices?.find((c: ChoiceDisplay) => c.id === question.correctAnswer);
			return choice ? `${choice.label}. ${choice.text}` : question.correctAnswer || "No answer provided";
		}
		
		return 'correctAnswer' in question ? question.correctAnswer || "No answer provided" : "No answer provided";
	};

	const handleCopyRoomId = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(room.id);
			toast.success("Room ID copied to clipboard");
		} catch (err) {
			console.error(err)
			toast.error("Failed to copy room ID");
		}
	};

	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<div className={`${styles.flex1} ${styles.minW0}`}>
						<h2 className={styles.modalTitle}>
							{room.title}
						</h2>
						<p className={styles.roomMeta}>
							Room number:{" "}
							<span className={styles.roomNumber}>{room.roomNumber}</span>
						</p>
						<div className={`${styles.roomMeta} ${styles.mt1} ${styles.copyableId}`}>
							Room ID:{" "}
							<span className={styles.roomNumber}>{room.id}</span>
							<button
								type="button"
								onClick={handleCopyRoomId}
								className={styles.copyButton}
								title="Copy room ID"
								aria-label="Copy room ID"
							>
								<svg
									width="14"
									height="14"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
									/>
								</svg>
							</button>
						</div>
						{room.requiresPassword && room.password && (
							<p className={`${styles.roomMeta} ${styles.mt1}`}>
								Password:{" "}
								<span className={styles.roomNumber}>{room.password}</span>
							</p>
						)}
					</div>
					<button
						type="button"
						onClick={onClose}
						className={styles.modalClose}
						aria-label="Close"
					>
						<svg
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<div className={styles.spaceY4}>
					{/* Loading State */}
					{isLoading && (
						<div className={styles.questionSection}>
							<div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
								<div style={{ marginBottom: "0.5rem" }}>Loading room details...</div>
								<div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
									Fetching questions and participants
								</div>
							</div>
						</div>
					)}

					{/* Error State */}
					{error && !isLoading && (
						<div className={styles.questionSection}>
							<div style={{ padding: "2rem", textAlign: "center", color: "#dc2626" }}>
								{error}
							</div>
						</div>
					)}

					{/* Current Question Section */}
					{!isLoading && !error && displayQuestions.length > 0 && currentQuestion ? (
						<div className={styles.questionSection}>
							<div className={styles.questionHeader}>
								<h3 className={`${styles.sectionTitle} ${styles.mb2}`}>
									Current Question ({currentQuestionIndex + 1} / {displayQuestions.length})
								</h3>
								<span className={styles.questionType}>
									{currentQuestion.type}
								</span>
							</div>
							<div className={styles.questionContent}>
								<p className={styles.questionText}>
									{'description' in currentQuestion ? currentQuestion.description : currentQuestion.text}
								</p>
								
								{currentQuestion.choices && (
									<div className={styles.choicesList}>
										{currentQuestion.choices.map((choice: ChoiceDisplay) => (
											<div key={choice.id} className={styles.choiceItem}>
												<span className={styles.choiceLabel}>{choice.label || '•'}.</span>
												<span className={styles.choiceText}>{choice.value || choice.text}</span>
											</div>
										))}
									</div>
								)}

								{showAnswer && (
									<div className={styles.answerSection}>
										<p className={styles.answerLabel}>Correct Answer:</p>
										<p className={styles.answerText}>
											{getAnswerDisplay(currentQuestion)}
										</p>
									</div>
								)}

								<button
									type="button"
									onClick={handleNext}
									className={styles.nextButton}
									disabled={isLastQuestion && showAnswer}
								>
									{showAnswer 
										? (isLastQuestion ? "Quiz Complete" : "Next Question")
										: "Show Answer"
									}
								</button>
							</div>
						</div>
					) : !isLoading && !error && displayQuestions.length === 0 ? (
						<div className={styles.questionSection}>
							<p className={styles.roomListEmpty}>
								No questions available for this room.
							</p>
						</div>
					) : null}

					{/* Players Section */}
					<div>
						<h3 className={`${styles.sectionTitle} ${styles.mb2}`}>
							Players ({players.length}
							{typeof room.maxPlayers === "number"
								? ` / ${room.maxPlayers}`
								: ""}
							)
						</h3>
						<div className={styles.spaceY2}>
							{players.length === 0 ? (
								<p className={styles.roomListEmpty}>
									No players have joined yet.
								</p>
							) : (
								players.map((player) => (
									<div key={player.id} className={styles.playerItem}>
										<div className={styles.playerContent}>
											<div className={styles.playerInfo}>
												<p className={styles.playerName}>
													{player.name}
												</p>
												{player.team && (
													<p className={styles.playerTeam}>
														{player.team}
													</p>
												)}
											</div>
											{typeof player.score === "number" && (
												<span className={styles.playerScore}>
													{player.score} pts
												</span>
											)}
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

