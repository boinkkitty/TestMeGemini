'use client';

import {Question} from "@/lib/types";
import {useState} from "react";
import QuestionCard from "@/components/questions/QuestionCard";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

type Props = {
    questions: Question[];
    onSubmit: () => void;
}


const PaginatedQuestions: React.FC<Props> = ({ questions, onSubmit }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState<number[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const currentQuestion = questions[currentIndex];

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === questions.length - 1;

    const goLeft = () => {
        if (!isFirst) setCurrentIndex(currentIndex - 1);
    }

    const goRight = () => {
        if (!isLast) setCurrentIndex(currentIndex + 1);
    }

    const handleSelect = (idx: number) => {
        if (currentQuestion.question_type === "MRQ") {
            setSelected((prev) =>
                prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
            );
        } else {
            setSelected([idx]);
        }
    };

    const handleSubmit = () => {
        setSubmitted(true);
        onSubmit();
    };

    return (
        <div className="w-128 h-128">
            <QuestionCard
                question={currentQuestion}
                selected={selected}
                onSelect={handleSelect}
                submitted={submitted}
            />

            <div className="mt-4 flex justify-between gap-4">
                {!isFirst && (
                    <button onClick={goLeft} className="px-3 py-1 rounded transition-colors hover:bg-gray-200 enabled:hover:cursor-pointer disabled:cursor-not-allowed" disabled={false}>
                        <HiChevronLeft size={22} />
                    </button>
                )}

                <button onClick={handleSubmit} className="px-3 py-1 rounded transition-colors hover:bg-blue-200 enabled:hover:cursor-pointer disabled:cursor-not-allowed" disabled={false}>
                    Submit
                </button>

                {!isLast && (
                    <button onClick={goRight} className="px-3 py-1 rounded transition-colors hover:bg-gray-200 enabled:hover:cursor-pointer disabled:cursor-not-allowed" disabled={false}>
                        <HiChevronRight size={22} />
                    </button>
                )}
            </div>
        </div>
    )
}

export default PaginatedQuestions;