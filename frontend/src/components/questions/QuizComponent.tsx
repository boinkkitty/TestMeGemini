"use client";

import { useEffect, useState } from "react";
import { Chapter, ChapterAttemptInput, Question } from "@/lib/types";
import QuestionCard from "@/components/questions/QuestionCard";
import { submitChapterAttempt } from "@/services/attempts";
import { formatScore } from "@/utils/score";
import { getCategoryColor } from "@/utils/chapterStyles";

type QuizComponentProps = {
    chapter?: Chapter | null;
    questions: Question[];
    onBack?: () => void;
};

function QuizComponent({ chapter, questions, onBack }: QuizComponentProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<number[][]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (questions.length > 0) {
            setAnswers(Array.from({ length: questions.length }, () => []));
        }
    }, [questions]);

    const handleSelect = (questionIdx: number, choiceId: number) => {
        if (submitted) return;
        setAnswers(prev => {
            const next = [...prev];
            const q = questions[questionIdx];
            if (q.question_type === "MRQ") {
                next[questionIdx] = next[questionIdx].includes(choiceId)
                    ? next[questionIdx].filter(id => id !== choiceId)
                    : [...next[questionIdx], choiceId];
            } else {
                next[questionIdx] = [choiceId];
            }
            return next;
        });
    };

    const handleSubmit = async () => {
        const data: ChapterAttemptInput = {
            chapter_id: chapter!.id,
            order: questions.map(q => q.id),
            questions: questions.map((q, i) => ({
                question_id: q.id,
                selected_choices: answers[i] || [],
            })),
        };
        const res = await submitChapterAttempt(data);
        if (res) {
            setSubmitted(true);
            setScore(res.score);
        }
    };

    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
    const categoryColor = chapter ? getCategoryColor(chapter.category) : null;
    const pct = submitted && questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const badge = pct >= 70 ? "Great" : pct >= 40 ? "Decent" : "Retry";
    const badgeColor = pct >= 70 ? "text-green-600" : pct >= 40 ? "text-orange-500" : "text-red-500";
    const isMRQ = questions[currentIndex]?.question_type === "MRQ";

    return (
        <div className="flex flex-col min-h-screen">

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-card">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex-shrink-0"
                        >
                            ← Back
                        </button>
                    )}
                    <div>
                        <h2 className="text-[18px] font-bold tracking-tight text-foreground leading-tight">
                            {chapter?.title}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {submitted
                                ? `${formatScore(score)}/${questions.length} correct`
                                : `${questions.length} questions`}
                        </p>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    {submitted ? (
                        <span className={`text-sm font-bold ${badgeColor}`}>
                            {pct}% · {badge}
                        </span>
                    ) : (
                        categoryColor && (
                            <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                                style={{ background: categoryColor.bg, color: categoryColor.text }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: categoryColor.dot }} />
                                {chapter?.category}
                            </span>
                        )
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-[3px] bg-border">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Question content */}
            <div className="flex-1 px-8 py-6">
                <QuestionCard
                    question={questions[currentIndex]}
                    selected={answers[currentIndex] || []}
                    onSelect={(choiceId) => handleSelect(currentIndex, choiceId)}
                    submitted={submitted}
                    questionLabel={`Question ${currentIndex + 1} of ${questions.length}`}
                    isMRQ={isMRQ}
                />
            </div>

            {/* Bottom nav */}
            <div className="px-8 py-4 flex items-center justify-between border-t border-border">
                {currentIndex > 0 ? (
                    <button
                        onClick={() => setCurrentIndex(p => p - 1)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    >
                        ← Previous
                    </button>
                ) : <div />}

                <span className="text-sm font-semibold text-muted-foreground">
                    {currentIndex + 1} / {questions.length}
                </span>

                {currentIndex < questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentIndex(p => p + 1)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Next →
                    </button>
                ) : !submitted ? (
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Submit
                    </button>
                ) : <div />}
            </div>
        </div>
    );
}

export default QuizComponent;
