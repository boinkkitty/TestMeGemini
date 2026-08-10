"use client";

import React, { useState } from "react";
import { ChapterAttempt, QuestionAttempt } from "@/lib/types";
import QuestionAttemptCard from "@/components/attempts/QuestionAttemptCard";
import { getCategoryColor } from "@/utils/chapterStyles";

type PaginatedQuestionAttemptsProps = {
    attempts: QuestionAttempt[];
    attempt: ChapterAttempt;
    onBack: () => void;
};

function PaginatedQuestionAttempts({ attempts, attempt, onBack }: PaginatedQuestionAttemptsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentAttempt = attempts[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === attempts.length - 1;

    const pct = attempt.max_score ? Math.round((attempt.score / attempt.max_score) * 100) : 0;
    const badge = pct >= 70 ? "Great" : pct >= 40 ? "Decent" : "Retry";
    const badgeColor = pct >= 70 ? "text-green-600" : pct >= 40 ? "text-orange-500" : "text-red-500";
    const progress = attempts.length > 0 ? ((currentIndex + 1) / attempts.length) * 100 : 0;
    const formattedDate = new Date(attempt.completed_at).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
    });
    const categoryColor = getCategoryColor(attempt.category);

    return (
        <div className="flex flex-col min-h-screen">

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-card">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex-shrink-0"
                    >
                        ← Back
                    </button>
                    <div>
                        <h2 className="text-[18px] font-bold tracking-tight text-foreground leading-tight">
                            <span style={{ color: categoryColor.text }}>{attempt.category}</span>
                            {": "}
                            {attempt.title}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {formattedDate} · {attempt.score}/{attempt.max_score} correct
                        </p>
                    </div>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${badgeColor}`}>
                    {pct}% · {badge}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-[3px] bg-border">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Question content */}
            <div className="flex-1 px-8 py-6">
                <QuestionAttemptCard attempt={currentAttempt} questionNum={currentIndex + 1} />
            </div>

            {/* Bottom nav */}
            <div className="px-8 py-4 flex items-center justify-between border-t border-border">
                {!isFirst ? (
                    <button
                        onClick={() => setCurrentIndex(i => i - 1)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    >
                        ← Previous
                    </button>
                ) : <div />}

                <span className="text-sm font-semibold text-muted-foreground">
                    {currentIndex + 1} / {attempts.length}
                </span>

                {!isLast ? (
                    <button
                        onClick={() => setCurrentIndex(i => i + 1)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Next →
                    </button>
                ) : <div />}
            </div>
        </div>
    );
}

export default PaginatedQuestionAttempts;
