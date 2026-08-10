"use client";

import { useState } from "react";
import { Question } from "@/lib/types";

type PaginatedQuestionsForChapterProps = {
    questions: Question[];
};

function PaginatedQuestionsForChapter({ questions }: PaginatedQuestionsForChapterProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const currentQuestion = questions[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === questions.length - 1;
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

    const goLeft = () => {
        if (!isFirst) setCurrentIndex(currentIndex - 1);
        setShowAnswer(false);
    };
    const goRight = () => {
        if (!isLast) setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
    };

    return (
        <div className="w-full space-y-5">
            {/* Progress bar */}
            <div className="h-[3px] bg-border rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Question card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
                {/* Label */}
                <span className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider">
                    Question {currentIndex + 1} of {questions.length}
                </span>

                {/* Question text */}
                <p className="text-[15px] font-semibold text-foreground leading-relaxed tracking-tight">
                    {currentQuestion.question_text}
                </p>

                {/* Choices */}
                <div className="flex flex-col gap-2.5">
                    {currentQuestion.choices.map((choice) => {
                        const isCorrect = choice.is_correct;
                        const showCorrect = showAnswer && isCorrect;
                        return (
                            <div
                                key={choice.id}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-[1.5px] transition-all ${
                                    showCorrect
                                        ? "border-green-500 bg-green-50"
                                        : "border-border"
                                }`}
                            >
                                <span className={`text-sm flex-1 ${showCorrect ? "text-green-800 font-semibold" : "text-foreground"}`}>
                                    {choice.text}
                                </span>
                                {showCorrect && (
                                    <span className="ml-auto text-[11px] font-bold text-green-700 whitespace-nowrap">✓ Correct</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Show/hide answer */}
                <button
                    className="text-xs font-semibold px-3 py-1.5 rounded-md bg-background border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    onClick={() => setShowAnswer((prev) => !prev)}
                >
                    {showAnswer ? "Hide Answer" : "Show Answer"}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                {!isFirst ? (
                    <button
                        onClick={goLeft}
                        className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    >
                        ← Previous
                    </button>
                ) : <div />}

                <span className="text-sm font-semibold text-muted-foreground">
                    {currentIndex + 1} / {questions.length}
                </span>

                {!isLast ? (
                    <button
                        onClick={goRight}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Next →
                    </button>
                ) : <div />}
            </div>
        </div>
    );
}

export default PaginatedQuestionsForChapter;
