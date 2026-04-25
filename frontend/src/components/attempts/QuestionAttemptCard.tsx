"use client";

import React from "react";
import { QuestionAttempt } from "@/lib/types";
import AttemptChoices from "@/components/attempts/AttemptChoices";
import { formatScore } from "@/utils/score";

type QuestionAttemptCardProps = {
  attempt: QuestionAttempt;
};

function QuestionAttemptCard({ attempt }: QuestionAttemptCardProps) {
  const { question_detail, selected_choices, score } = attempt;
  const isMRQ = question_detail.question_type === "MRQ";

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5 w-full max-w-xl">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[15px] font-semibold text-foreground leading-relaxed tracking-tight flex-1">
          {question_detail.question_text}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isMRQ && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-primary uppercase tracking-wide">
              MRQ
            </span>
          )}
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${score > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {formatScore(score)} / 1
          </span>
        </div>
      </div>
      <AttemptChoices choices={question_detail.choices} selected={selected_choices} />
    </div>
  );
}

export default QuestionAttemptCard;
