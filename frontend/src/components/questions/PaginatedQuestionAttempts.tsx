import React, { useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { QuestionAttempt } from "@/lib/types";
import QuestionAttemptCard from "@/components/questions/QuestionAttemptCard";

type PaginatedQuestionAttemptsProps = {
  attempts: QuestionAttempt[];
};

function PaginatedQuestionAttempts({ attempts }: PaginatedQuestionAttemptsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAttempt = attempts[currentIndex];

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === attempts.length - 1;

  const goLeft = () => {
    if (!isFirst) setCurrentIndex(currentIndex - 1);
  };

  const goRight = () => {
    if (!isLast) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="w-128 h-128">
      <QuestionAttemptCard attempt={currentAttempt} />
      <div className="mt-4 flex justify-between gap-4">
        <div className={`flex w-full gap-2 ${isFirst ? "justify-end" : isLast ? "justify-start" : "justify-between"}`}>
          {!isFirst && (
            <button onClick={goLeft} className="px-3 py-1 rounded transition-colors hover:bg-gray-200 enabled:hover:cursor-pointer disabled:cursor-not-allowed" disabled={false}>
              <HiChevronLeft size={22} />
            </button>
          )}
          {!isLast && (
            <button onClick={goRight} className="px-3 py-1 rounded transition-colors hover:bg-gray-200 enabled:hover:cursor-pointer disabled:cursor-not-allowed" disabled={false}>
              <HiChevronRight size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaginatedQuestionAttempts;
