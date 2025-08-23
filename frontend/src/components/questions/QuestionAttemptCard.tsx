"use client";

import React from "react";
import { QuestionAttempt } from "@/lib/types";
import AttemptChoices from "@/components/questions/AttemptChoices";

type QuestionAttemptCardProps = {
  attempt: QuestionAttempt;
};


function QuestionAttemptCard({ attempt }: QuestionAttemptCardProps) {
  const { question_detail, selected_choices, score } = attempt;
  // Dynamic gap for choices
  const gapClass = (question_detail.choices.length <= 2) ? "gap-8" : (question_detail.choices.length === 3 ? "gap-6" : "gap-4");
  return (
    <div className="bg-white shadow-md rounded-md p-6 max-w-xl mx-auto min-h-[16rem] flex flex-col justify-between w-full">
      <div className="flex flex-row items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800 flex-1">
          {question_detail.question_text}
        </h3>
        <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 font-bold text-sm rounded-full whitespace-nowrap">{score.toFixed(2)} / 1</span>
      </div>
      <div className={`flex flex-col flex-1 justify-center ${gapClass}`}>
        <AttemptChoices choices={question_detail.choices} selected={selected_choices} />
      </div>
    </div>
  );
}

export default QuestionAttemptCard;