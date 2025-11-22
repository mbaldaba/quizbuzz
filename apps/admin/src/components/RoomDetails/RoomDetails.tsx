import React, { useState } from "react";
import { IActiveRoom, IPlayer, IQuestionData, QuestionType } from "../../common/types";
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
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
	const [showAnswer, setShowAnswer] = useState<boolean>(false);

	const currentQuestion = questions[currentQuestionIndex];
	const isLastQuestion = currentQuestionIndex === questions.length - 1;

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

	const getAnswerDisplay = (question: IQuestionData): string => {
		if (!question.correctAnswer) return "No answer provided";
		
		if (question.type === QuestionType.multiple_choice) {
			const choice = question.choices?.find(c => c.id === question.correctAnswer);
			return choice ? `${choice.label}. ${choice.text}` : question.correctAnswer;
		}
		
		return question.correctAnswer;
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
					{questions.length > 0 && currentQuestion ? (
						<div className={styles.questionSection}>
							<div className={styles.questionHeader}>
								<h3 className={`${styles.sectionTitle} ${styles.mb2}`}>
									Current Question ({currentQuestionIndex + 1} / {questions.length})
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
					) : questions.length === 0 ? (
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

