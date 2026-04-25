import React, { useState } from "react";
import { QuestionAttempt } from "@/lib/types";
import QuestionAttemptCard from "@/components/attempts/QuestionAttemptCard";

type PaginatedQuestionAttemptsProps = {
  attempts: QuestionAttempt[];
};

function PaginatedQuestionAttempts({ attempts }: PaginatedQuestionAttemptsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAttempt = attempts[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === attempts.length - 1;

  return (
    <div className="max-w-xl w-full space-y-4">
      <QuestionAttemptCard attempt={currentAttempt} />

      {/* Navigation */}
      <div className="flex items-center justify-between">
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
