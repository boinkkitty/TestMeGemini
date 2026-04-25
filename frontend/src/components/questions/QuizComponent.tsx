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
};

function QuizComponent({ chapter, questions }: QuizComponentProps) {
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

    const isMRQ = questions[currentIndex]?.question_type === "MRQ";
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
    const categoryColor = chapter ? getCategoryColor(chapter.category) : null;

    return (
        <div className="max-w-2xl mx-auto space-y-5">

            {/* Chapter header */}
            {chapter && (
                <div className="flex items-center gap-3">
                    {categoryColor && (
                        <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{ background: categoryColor.bg, color: categoryColor.text }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: categoryColor.dot }} />
                            {chapter.category}
                        </span>
                    )}
                    <span className="text-[15px] font-bold tracking-tight text-foreground">{chapter.title}</span>
                </div>
            )}

            {/* Score banner (post-submit) */}
            {submitted && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl px-5 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-primary">Quiz complete!</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Review your answers below</p>
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight text-primary">
                        {formatScore(score)} / {questions.length}
                    </div>
                </div>
            )}

            {/* Progress bar */}
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Question counter + MRQ tag */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                    Question {currentIndex + 1} of {questions.length}
                </span>
                {isMRQ && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-primary uppercase tracking-wide">
                        Select all that apply
                    </span>
                )}
            </div>

            {/* Question card */}
            <QuestionCard
                question={questions[currentIndex]}
                selected={answers[currentIndex] || []}
                onSelect={(choiceId) => handleSelect(currentIndex, choiceId)}
                submitted={submitted}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between">
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
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                        Submit
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export default QuizComponent;
