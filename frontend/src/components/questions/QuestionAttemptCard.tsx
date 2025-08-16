"use client";

import React from "react";
import { QuestionAttempt } from "@/lib/types";
import AttemptChoices from "@/components/questions/AttemptChoices";

interface Props {
  attempt: QuestionAttempt;
}

const QuestionAttemptCard: React.FC<Props> = ({ attempt }) => {
  const { question, selected_choices, score } = attempt;
  return (
    <div className="bg-white shadow-md rounded-md p-6 max-w-xl mx-auto relative">
      <div className="absolute top-4 right-6 text-green-700 font-bold text-lg">{score} / 1</div>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {question.question_text}
      </h3>
      <AttemptChoices choices={question.choices} selected={selected_choices} />
    </div>
  );
};

export default QuestionAttemptCard;