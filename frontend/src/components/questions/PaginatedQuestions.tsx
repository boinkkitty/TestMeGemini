'use client';

import {Question} from "@/lib/types";
import {useState} from "react";
import QuestionCard from "@/components/questions/QuestionCard";

type Props = {
    questions: Question[];
    onSubmit: () => void;
}

const PaginatedQuestions: React.FC<Props> = ({ questions, onSubmit }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentQuestion = questions[currentIndex];

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === questions.length - 1;

    const goLeft = () => {
        if (!isFirst) setCurrentIndex(currentIndex - 1);
    }

    const goRight = () => {
        if (!isLast) setCurrentIndex(currentIndex + 1);
    }

    return (
        <div className="w-128 h-128">
            <QuestionCard
                question={currentQuestion}
            />

            <div className="mt-4 flex justify-between gap-4">
                {!isFirst && (
                    <button onClick={goLeft}>
                        Left
                    </button>
                )}

                <button onClick={onSubmit}>
                    Submit
                </button>

                {!isLast && (
                    <button onClick={goRight}>
                        Right
                    </button>
                )}
            </div>
        </div>
    )
}

export default PaginatedQuestions;