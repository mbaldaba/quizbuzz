import React, { useState } from "react";
import { useStudentRoom } from "../hooks/useStudentRoom";

export default function StudentRoomView() {
	const {
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
	} = useStudentRoom();

	const [answerText, setAnswerText] = useState("");

	const isBuzzPhase = phase === "buzz";
	const isAnswerPhase = phase === "answer";

	const timerLabel = isBuzzPhase
		? `Time to buzz: ${timeRemaining}s / ${buzzDuration}s`
		: isAnswerPhase
			? `Time to answer: ${timeRemaining}s / ${answerDuration}s`
			: "Waiting for next question";

	const buzzerDisabled = !isBuzzPhase || isBuzzLocked;
	const showAnswerControls = isAnswerPhase && hasBuzzed;

	const onBuzz = () => {
		// TODO: send buzz event to server
	};

	const onSubmitAnswer = () => {
		// TODO: send answerText to server as text answer
		// e.g. socket.emit("submit_answer", { answer: answerText })
	};

	return (
		<div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-6">
			<div className="w-full max-w-6xl space-y-4">
				{/* Header */}
				<header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2">
							<p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
								Quiz Room
							</p>
							<p className="font-mono text-sm text-sky-400">
								#{roomCode || "------"}
							</p>
						</div>
						<div>
							<p className="text-xs text-slate-400">Player</p>
							<p className="text-sm font-semibold">{playerName}</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						{typeof totalQuestions === "number" && (
							<div className="text-xs text-slate-400">
								Question{" "}
								<span className="font-semibold text-slate-100">
									{questionNumber}
								</span>{" "}
								/ {totalQuestions}
							</div>
						)}
						<div className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs flex items-center gap-2">
							<span
								className={`inline-flex h-2 w-2 rounded-full ${
									isBuzzPhase
										? "bg-emerald-400"
										: isAnswerPhase
											? "bg-amber-400"
											: "bg-slate-500"
								}`}
							/>
							<span className="text-slate-300 text-[11px] md:text-xs">
								{isBuzzPhase
									? "Buzz phase"
									: isAnswerPhase
										? "Answer phase"
										: "Waiting"}
							</span>
						</div>
					</div>
				</header>

				{/* Main */}
				<main className="grid grid-cols-1 lg:grid-cols-[2fr,1.3fr] gap-4">
					{/* Question panel */}
					<section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col gap-4">
						{/* Timer + type */}
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div>
								<p className="text-[11px] uppercase tracking-[0.18em] text-sky-400/80 mb-1">
									Timer
								</p>
								<p className="text-sm font-medium text-slate-100">
									{timerLabel}
								</p>
							</div>

							{question && (
								<div className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1">
									<span className="text-[11px] text-slate-400 mr-1">
										Question Type
									</span>
									<span className="text-xs font-semibold text-sky-300">
										Text
									</span>
								</div>
							)}
						</div>

						{/* Question text */}
						<div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
							<p className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-1.5">
								Question
							</p>
							<p className="text-sm md:text-base text-slate-50 leading-relaxed">
								{question?.text || "Waiting for the next question..."}
							</p>
						</div>

						{/* Text answer input */}
						{question && (
							<div className="mt-2">
								<p className="text-xs text-slate-400 mb-2">Type your answer</p>
								<input
									type="text"
									value={answerText}
									onChange={(e) => setAnswerText(e.target.value)}
									disabled={!showAnswerControls}
									placeholder={
										showAnswerControls
											? "Enter your answer here"
											: "You can only answer if you buzzed first"
									}
									className={`
                    w-full rounded-xl border bg-slate-950/60 px-3 py-2 text-sm text-slate-50
                    placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500
                    ${!showAnswerControls ? "opacity-50 cursor-not-allowed" : ""}
                  `}
								/>

								{showAnswerControls && (
									<div className="mt-4">
										<button
											type="button"
											onClick={onSubmitAnswer}
											className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 focus:ring-2 focus:ring-emerald-400"
										>
											Submit Answer
										</button>
									</div>
								)}
							</div>
						)}
					</section>

					{/* Right: Buzzer + status */}
					<aside className="flex flex-col gap-4">
						{/* Buzzer */}
						<div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col items-center gap-3">
							<p className="text-xs text-slate-400 mb-1">
								{isBuzzPhase
									? "Tap the buzzer if you want to answer."
									: isAnswerPhase
										? hasBuzzed
											? "You buzzed first. Answer below!"
											: currentResponderName
												? `${currentResponderName} is answering.`
												: "Someone is answering."
										: "Waiting for the next round."}
							</p>

							<button
								type="button"
								onClick={onBuzz}
								disabled={buzzerDisabled}
								className={`
                  rounded-full px-10 py-10 md:px-14 md:py-14 text-xl md:text-2xl font-extrabold uppercase transition
                  ${
										buzzerDisabled
											? "bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600"
											: "bg-rose-500 text-slate-950 shadow-[0_0_60px_rgba(248,113,113,0.8)] border border-rose-300 hover:scale-105 active:scale-95"
									}
                `}
							>
								Buzz!
							</button>

							{hasBuzzed && (
								<p className="text-xs font-medium text-emerald-300">
									You buzzed first. Get ready to answer!
								</p>
							)}

							{!hasBuzzed && currentResponderName && (
								<p className="text-xs text-slate-400">
									<span className="font-semibold text-slate-100">
										{currentResponderName}
									</span>{" "}
									is answering.
								</p>
							)}
						</div>

						{/* Player Status */}
						<div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
							<p className="text-xs uppercase tracking-[0.18em] text-slate-500">
								Player Status
							</p>
							<p className="text-sm text-slate-100">
								{hasBuzzed
									? "You are the current responder for this question."
									: isBuzzPhase
										? "Tap the buzzer when you know the answer."
										: isAnswerPhase
											? currentResponderName
												? `${currentResponderName} is answering now.`
												: "Someone is answering."
											: "Stand by for the next question."}
							</p>
						</div>
					</aside>
				</main>
			</div>
		</div>
	);
}
