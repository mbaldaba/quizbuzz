import React, { useState } from "react";
import { IQuestionData, QuestionType } from "../../common/types";
import styles from "./QuestionManager.module.scss";

type QuestionManagerProps = {
	questions: IQuestionData[];
	onAddQuestion: (question: Omit<IQuestionData, "id">) => void;
	onUpdateQuestion: (questionId: string, question: Omit<IQuestionData, "id">) => void;
	onDeleteQuestion: (questionId: string) => void;
};

export default function QuestionManager({
	questions,
	onAddQuestion,
	onUpdateQuestion,
	onDeleteQuestion,
}: QuestionManagerProps) {
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingQuestion, setEditingQuestion] = useState<IQuestionData | null>(null);
	const [questionType, setQuestionType] = useState<QuestionType>(
		QuestionType.multiple_choice
	);
	const [questionText, setQuestionText] = useState("");
	const [choices, setChoices] = useState([
		{ id: "a", label: "A", text: "" },
		{ id: "b", label: "B", text: "" },
		{ id: "c", label: "C", text: "" },
		{ id: "d", label: "D", text: "" },
	]);
	const [correctAnswer, setCorrectAnswer] = useState("");
	const [error, setError] = useState("");

	const resetForm = () => {
		setQuestionText("");
		setCorrectAnswer("");
		setChoices([
			{ id: "a", label: "A", text: "" },
			{ id: "b", label: "B", text: "" },
			{ id: "c", label: "C", text: "" },
			{ id: "d", label: "D", text: "" },
		]);
		setEditingQuestion(null);
		setShowAddForm(false);
	};

	const handleEdit = (question: IQuestionData) => {
		setEditingQuestion(question);
		setQuestionType(question.type);
		setQuestionText(question.text);
		setCorrectAnswer(question.correctAnswer || "");
		if (question.choices) {
			setChoices(question.choices);
		} else {
			setChoices([
				{ id: "a", label: "A", text: "" },
				{ id: "b", label: "B", text: "" },
				{ id: "c", label: "C", text: "" },
				{ id: "d", label: "D", text: "" },
			]);
		}
		setShowAddForm(true);
	};

	const handleSubmit = () => {
		setError("");

		if (!questionText.trim()) {
			setError("Please enter a question.");
			return;
		}

		if (questionType === QuestionType.multiple_choice) {
			if (!choices.every((c) => c.text.trim())) {
				setError("Please fill in all choices.");
				return;
			}
			if (!correctAnswer) {
				setError("Please select the correct answer.");
				return;
			}
		} else if (!correctAnswer.trim()) {
			setError("Please enter the correct answer.");
			return;
		}

		const questionData = {
			type: questionType,
			text: questionText.trim(),
			choices:
				questionType === QuestionType.multiple_choice ? choices : undefined,
			correctAnswer: correctAnswer.trim(),
		};

		if (editingQuestion) {
			onUpdateQuestion(editingQuestion.id, questionData);
		} else {
			onAddQuestion(questionData);
		}

		resetForm();
	};

	return (
		<div className="admin-section">
			<div className="section-header">
				<div className={styles.flex1}>
					<h2 className="section-title">
						Question Bank
					</h2>
					<p className="section-subtitle">
						Manage quiz questions for your rooms
					</p>
				</div>
				<button
					type="button"
					onClick={() => {
						if (showAddForm) {
							resetForm();
						} else {
							setShowAddForm(true);
						}
					}}
					className={`${styles.btn} ${styles.btnPrimary} ${styles.btnAdd}`}
				>
					{showAddForm ? "Cancel" : "+ Add Question"}
				</button>
			</div>

			{showAddForm && (
				<div className={styles.questionForm}>
					<div className={styles.formGroup}>
						<label className={styles.formLabel}>
							Question Type
						</label>
						<select
							value={questionType}
							onChange={(e) => setQuestionType(e.target.value as QuestionType)}
							className={styles.formSelect}
						>
							{Object.values(QuestionType).map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>

					<div className={styles.formGroup}>
						<label className={styles.formLabel}>
							Question
						</label>
						<textarea
							value={questionText}
							onChange={(e) => setQuestionText(e.target.value)}
							placeholder="Enter your question here..."
							rows={3}
							className={styles.formTextarea}
						/>
					</div>

					{questionType === QuestionType.multiple_choice && (
						<div className={styles.spaceY2}>
							<label className={styles.formLabel}>
								Choices
							</label>
							{choices.map((choice) => (
								<div key={choice.id} className={styles.formRow}>
									<div className={styles.choiceInputGroup}>
										<span className={styles.choiceLabel}>
											{choice.label}:
										</span>
										<input
											type="text"
											value={choice.text}
											onChange={(e) => {
												setChoices(
													choices.map((c) =>
														c.id === choice.id
															? { ...c, text: e.target.value }
															: c
													)
												);
											}}
											placeholder={`Option ${choice.label}`}
											className={`${styles.choiceInput} ${styles.formInput}`}
										/>
									</div>
								</div>
							))}
							<div className={`${styles.formGroup} ${styles.mt2}`}>
								<label className={styles.formLabel}>
									Correct Answer
								</label>
								<select
									value={correctAnswer}
									onChange={(e) => setCorrectAnswer(e.target.value)}
									className={styles.formSelect}
								>
									<option value="">Select correct answer</option>
									{choices.map((choice) => (
										<option key={choice.id} value={choice.id}>
											{choice.label}: {choice.text || "..."}
										</option>
									))}
								</select>
							</div>
						</div>
					)}

					{(questionType === QuestionType.true_false ||
						questionType === QuestionType.identification) && (
						<div className={styles.formGroup}>
							<label className={styles.formLabel}>
								Correct Answer
							</label>
							{questionType === QuestionType.true_false ? (
								<select
									value={correctAnswer}
									onChange={(e) => setCorrectAnswer(e.target.value)}
									className={styles.formSelect}
								>
									<option value="">Select answer</option>
									<option value="true">True</option>
									<option value="false">False</option>
								</select>
							) : (
								<input
									type="text"
									value={correctAnswer}
									onChange={(e) => setCorrectAnswer(e.target.value)}
									placeholder="Enter correct answer"
									className={styles.formInput}
								/>
							)}
						</div>
					)}

					{error && (
						<p className={styles.formError}>
							{error}
						</p>
					)}

					<button
						type="button"
						onClick={handleSubmit}
						className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
					>
						{editingQuestion ? "Update Question" : "Add Question"}
					</button>
				</div>
			)}

			<div className={styles.spaceY2}>
				{questions.length === 0 ? (
					<p className={styles.roomListEmpty}>
						No questions yet. Add your first question to get started.
					</p>
				) : (
					questions.map((question) => (
						<div key={question.id} className={styles.questionItem}>
							<div className={styles.questionContent}>
								<div className={styles.questionInfo}>
									<span className={styles.questionTypeBadge}>
										{question.type}
									</span>
									<p className={styles.questionText}>
										{question.text}
									</p>
									{question.choices && (
										<ul className={styles.questionChoices}>
											{question.choices.map((choice) => (
												<li key={choice.id}>
													{choice.label}: {choice.text}
												</li>
											))}
										</ul>
									)}
									{question.correctAnswer && (
										<p className={styles.questionAnswer}>
											Correct: {question.correctAnswer}
										</p>
									)}
								</div>
								<div className={styles.questionActions}>
									<button
										type="button"
										onClick={() => handleEdit(question)}
										className={`${styles.btn} ${styles.btnIcon}`}
										title="Edit question"
									>
										<svg
											width="16"
											height="16"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											/>
										</svg>
									</button>
									<button
										type="button"
										onClick={() => {
											if (window.confirm("Are you sure you want to delete this question?")) {
												onDeleteQuestion(question.id);
											}
										}}
										className={`${styles.btn} ${styles.btnIcon}`}
										title="Delete question"
									>
										<svg
											width="16"
											height="16"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}

