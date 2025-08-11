"use client";

import {useEffect, useState} from "react";
import {Question} from "@/lib/types";
import QuestionCard from "@/components/questions/QuestionCard";

type QuizComponentProps = {
    questions: Question[];
}

const QuizComponent: React.FC<QuizComponentProps> = ({questions}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<number[][]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (questions.length > 0) {
            // Create an array of length questions.length, each being an empty array (no selections yet)
            setAnswers(Array.from({ length: questions.length }, () => []));
        }
    }, [questions]);

    const handleSelect = (questionIdx: number, choiceIdx: number) => {
        setAnswers((prev) => {
            const newAnswers = [...prev];
            const currQuestion: Question = questions[questionIdx];
            if (currQuestion.question_type === "MRQ") {
                newAnswers[questionIdx] = newAnswers[questionIdx].includes(choiceIdx)
                ? newAnswers[questionIdx].filter((i) => i !== choiceIdx)
                    : [...newAnswers[questionIdx], choiceIdx];
            } else {
                newAnswers[questionIdx] = [choiceIdx];
            }
            return newAnswers;
        })
    }

    // Need to work on this
    const handleSubmit = () => {
        let newScore = 0;
        questions.forEach((q, idx) => {
            const correctIdxs = q.choices
                .map((c, i) => (c.is_correct ? i : null))
                .filter((i) => i !== null) as number[];

            const userChoices = answers[idx].sort();
            const isCorrect =
                JSON.stringify(userChoices) === JSON.stringify(correctIdxs.sort());
            if (isCorrect) newScore++;
        });
        setScore(newScore);
        setSubmitted(true);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Score on top right */}
            {submitted && (
                <div className="text-right font-bold text-lg mb-2">
                    Score: {score} / {questions.length}
                </div>
            )}

            {/* Current Question */}
            <QuestionCard
                question={questions[currentIndex]}
                selected={answers[currentIndex]}
                onSelect={(choiceIdx) => handleSelect(currentIndex, choiceIdx)}
                submitted={submitted}
            />

            {/* Pagination */}
            <div className="flex justify-between mt-4">
                {currentIndex > 0 ? (
                    <button
                        onClick={() => setCurrentIndex((prev) => prev - 1)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        ← Previous
                    </button>
                ) : (
                    <div />
                )}

                {currentIndex < questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Next →
                    </button>
                ) : !submitted ? (
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Submit
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export default QuizComponent;