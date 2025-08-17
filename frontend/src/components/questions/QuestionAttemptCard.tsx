"use client";

import React from "react";
import { QuestionAttempt } from "@/lib/types";
import AttemptChoices from "@/components/questions/AttemptChoices";

type QuestionAttemptCardProps = {
  attempt: QuestionAttempt;
};

function QuestionAttemptCard({ attempt }: QuestionAttemptCardProps) {
  const { question_detail, selected_choices, score } = attempt;
  return (
    <div className="bg-white shadow-md rounded-md p-6 max-w-xl mx-auto relative">
      <div className="absolute top-4 right-6 text-green-700 font-bold text-lg">{score} / 1</div>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {question_detail.question_text}
      </h3>
      <AttemptChoices choices={question_detail.choices} selected={selected_choices} />
    </div>
  );
}

export default QuestionAttemptCard;