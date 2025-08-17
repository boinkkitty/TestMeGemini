"use client";

import {useEffect, useState} from "react";
import {Chapter, ChapterAttempt, ChapterAttemptInput, Question} from "@/lib/types";
import QuestionCard from "@/components/questions/QuestionCard";
import {submitChapterAttempt} from "@/utils/clientSide/submitChapterAttempt";

type QuizComponentProps = {
    chapter?: Chapter | null;
    questions: Question[];
}

const QuizComponent: React.FC<QuizComponentProps> = ({chapter, questions}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Store selected choice IDs for each question
    const [answers, setAnswers] = useState<number[][]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (questions.length > 0) {
            // Create an array of length questions.length, each being an empty array (no selections yet)
            setAnswers(Array.from({ length: questions.length }, () => []));
        }
    }, [questions]);

    const handleSelect = (questionIdx: number, choiceId: number) => {
        console.log("Adding choice", choiceId, "for question", questionIdx)
        setAnswers((prev) => {
            const newAnswers = [...prev];
            const currQuestion: Question = questions[questionIdx];
            if (currQuestion.question_type === "MRQ") {
                newAnswers[questionIdx] = newAnswers[questionIdx].includes(choiceId)
                    ? newAnswers[questionIdx].filter((id) => id !== choiceId)
                    : [...newAnswers[questionIdx], choiceId];
            } else {
                newAnswers[questionIdx] = [choiceId];
            }
            console.log("Prev answers:", prev);
            console.log("Updated answers:", newAnswers);

            return newAnswers;
        });
    };

    useEffect(() => {
        console.log(questions);
        console.log(answers);
    }, [questions, answers]);

    // Need to work on this
    const handleSubmit = async () => {
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

        const data: ChapterAttemptInput = {
            chapter_id: chapter!.id,
            order: questions.map(question => question.id),
            questions: questions.map((question, i) => ({
                question_id: question.id,
                selected_choices: answers[i] || [],
            })),
        };

        console.log(data);
        const res = await submitChapterAttempt(data);
        if (res) {
            setSubmitted(true);
        }
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
                onSelect={(choiceId) => handleSelect(currentIndex, choiceId)}
                submitted={submitted}
            />

            {/* Pagination */}
            <div className="flex justify-between mt-4">
                {currentIndex > 0 ? (
                    <button
                        onClick={() => setCurrentIndex((prev) => prev - 1)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors enabled:hover:cursor-pointer disabled:cursor-not-allowed"
                        disabled={false}
                    >
                        ← Previous
                    </button>
                ) : (
                    <div />
                )}

                {currentIndex < questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors enabled:hover:cursor-pointer disabled:cursor-not-allowed"
                        disabled={false}
                    >
                        Next →
                    </button>
                ) : !submitted ? (
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors enabled:hover:cursor-pointer disabled:cursor-not-allowed"
                        disabled={false}
                    >
                        Submit
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export default QuizComponent;