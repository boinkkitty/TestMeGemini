"use client";

import React from "react";
import { QuestionAttempt } from "@/lib/types";
import AttemptChoices from "@/components/attempts/AttemptChoices";

type QuestionAttemptCardProps = {
    attempt: QuestionAttempt;
    questionNum?: number;
};

function QuestionAttemptCard({ attempt, questionNum }: QuestionAttemptCardProps) {
    const { question_detail, selected_choices, score } = attempt;
    const isMRQ = question_detail.question_type === "MRQ";
    const isCorrect = score > 0;

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5 w-full">
            {/* Header row: question label + correct/incorrect */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    {questionNum !== undefined && (
                        <span className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider">
                            Question {questionNum}
                        </span>
                    )}
                    {isMRQ && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-primary uppercase tracking-wide">
                            MRQ
                        </span>
                    )}
                </div>
                <span className={`text-[11.5px] font-bold flex-shrink-0 ${isCorrect ? "text-green-600" : "text-red-500"}`}>
                    {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                </span>
            </div>

            {/* Question text */}
            <p className="text-[15px] font-semibold text-foreground leading-relaxed tracking-tight">
                {question_detail.question_text}
            </p>

            <AttemptChoices choices={question_detail.choices} selected={selected_choices} />
        </div>
    );
}

export default QuestionAttemptCard;
