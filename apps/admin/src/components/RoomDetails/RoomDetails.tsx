import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { IActiveRoom, IPlayer, IQuestionData, QuestionType } from "../../common/types";
import { useNextQuestion, useRevealAnswer, useCurrentQuestion } from "../../hooks/useQuizmaster";
import styles from "./RoomDetails.module.scss";

type RoomDetailsProps = {
	room: IActiveRoom;
	players: IPlayer[];
	questions: IQuestionData[];
	onClose: () => void;
};

export default function RoomDetails({
	room,
	players,
	questions,
	onClose,
}: RoomDetailsProps) {
	const [showAnswer, setShowAnswer] = useState<boolean>(false);

	// Use quizmaster hooks for API integration
	const { data: currentQuestion } = useCurrentQuestion(room.id);
	const nextQuestionMutation = useNextQuestion();
	const revealAnswerMutation = useRevealAnswer();

	// Reset showAnswer when question changes
	useEffect(() => {
		setShowAnswer(false);
	}, [currentQuestion?.id]);

	const handleShowAnswer = () => {
		if (!currentQuestion) {
			toast.error("No question available");
			return;
		}

		revealAnswerMutation.mutate(
			{ roomId: room.id, questionId: currentQuestion.id },
			{
				onSuccess: () => {
					setShowAnswer(true);
				},
			}
		);
	};

	const handleNextQuestion = () => {
		nextQuestionMutation.mutate(room.id, {
			onSuccess: () => {
				setShowAnswer(false);
			},
		});
	};

	const getAnswerDisplay = (question: IQuestionData): string => {
		if (!question.correctAnswer) return "No answer provided";
		
		if (question.type === QuestionType.multiple_choice) {
			const choice = question.choices?.find(c => c.id === question.correctAnswer);
			return choice ? `${choice.label}. ${choice.text}` : question.correctAnswer;
		}
		
		return question.correctAnswer;
	};

	const handleCopyRoomId = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(room.id);
			toast.success("Room ID copied to clipboard");
		} catch (err) {
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
					{/* Current Question Section */}
					{currentQuestion ? (
						<div className={styles.questionSection}>
							<div className={styles.questionHeader}>
								<h3 className={`${styles.sectionTitle} ${styles.mb2}`}>
									Current Question
								</h3>
								<span className={styles.questionType}>
									{currentQuestion.type}
								</span>
							</div>
							<div className={styles.questionContent}>
								<p className={styles.questionText}>
									{currentQuestion.text}
								</p>
								
								{currentQuestion.choices && (
									<div className={styles.choicesList}>
										{currentQuestion.choices.map((choice) => (
											<div key={choice.id} className={styles.choiceItem}>
												<span className={styles.choiceLabel}>{choice.label}.</span>
												<span className={styles.choiceText}>{choice.text}</span>
											</div>
										))}
									</div>
								)}

								{showAnswer && currentQuestion.correctAnswer && (
									<div className={styles.answerSection}>
										<p className={styles.answerLabel}>Correct Answer:</p>
										<p className={styles.answerText}>
											{getAnswerDisplay(currentQuestion)}
										</p>
									</div>
								)}

								{!showAnswer ? (
									<button
										type="button"
										onClick={handleShowAnswer}
										className={styles.nextButton}
										disabled={revealAnswerMutation.isPending}
									>
										{revealAnswerMutation.isPending ? "Revealing..." : "Show Answer"}
									</button>
								) : (
									<button
										type="button"
										onClick={handleNextQuestion}
										className={styles.nextButton}
										disabled={nextQuestionMutation.isPending}
									>
										{nextQuestionMutation.isPending ? "Loading..." : "Next Question"}
									</button>
								)}
							</div>
						</div>
					) : (
						<div className={styles.questionSection}>
							<p className={styles.roomListEmpty}>
								No question active. Click "Next Question" to start.
							</p>
							<button
								type="button"
								onClick={handleNextQuestion}
								className={styles.nextButton}
								disabled={nextQuestionMutation.isPending}
							>
								{nextQuestionMutation.isPending ? "Loading..." : "Start First Question"}
							</button>
						</div>
					)}

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

