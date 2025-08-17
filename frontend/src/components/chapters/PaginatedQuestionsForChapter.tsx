"use client";

import { useState } from "react";
import { Question } from "@/lib/types";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

interface Props {
  questions: Question[];
}

const PaginatedQuestionsForChapter: React.FC<Props> = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const currentQuestion = questions[currentIndex];

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  const goLeft = () => {
    if (!isFirst) setCurrentIndex(currentIndex - 1);
    setShowAnswer(false);
  };
  const goRight = () => {
    if (!isLast) setCurrentIndex(currentIndex + 1);
    setShowAnswer(false);
  };

  return (
    <div className="w-128 h-128 flex flex-col items-center justify-center">
      <div className="bg-white shadow-md rounded-md p-6 max-w-xl mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {currentQuestion.question_text}
        </h3>
        <div className="flex flex-col gap-2 mt-2">
          {currentQuestion.choices.map((choice, idx) => {
            const isCorrect = choice.is_correct;
            return (
              <div
                key={choice.id}
                className={`flex items-center border-b last:border-b-0 pb-2 mb-2 ${
                  showAnswer && isCorrect
                    ? "text-green-700 font-semibold"
                    : "text-gray-700"
                }`}
              >
                <span>{choice.text}</span>
                {showAnswer && isCorrect && (
                  <span className="ml-2 text-green-600">✔</span>
                )}
              </div>
            );
          })}
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
          onClick={() => setShowAnswer((prev) => !prev)}
        >
          {showAnswer ? "Hide Answer" : "Show Answer"}
        </button>
      </div>
      <div
        className={
          `mt-4 flex w-full gap-2 ` +
          (isFirst
            ? "justify-end"
            : isLast
            ? "justify-start"
            : "justify-between")
        }
      >
        {!isFirst && (
          <button
            onClick={goLeft}
            className="px-3 py-1 rounded transition-colors hover:bg-gray-200 enabled:hover:cursor-pointer disabled:cursor-not-allowed"
            disabled={false}
          >
            <HiChevronLeft size={22} />
          </button>
        )}
        {!isLast && (
          <button
            onClick={goRight}
            className="px-3 py-1 rounded transition-colors hover:bg-gray-200 enabled:hover:cursor-pointer disabled:cursor-not-allowed"
            disabled={false}
          >
            <HiChevronRight size={22} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PaginatedQuestionsForChapter;
