"use client";
import { Chapter, Question } from "@/lib/types";
import QuizComponent from "@/components/questions/QuizComponent";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getUserChapters } from "@/services/chapters";
import { getChapterQuestions } from "@/services/questions";
import { getCategoryColor } from "@/utils/chapterStyles";

export default function Quiz() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isStarted, setIsStarted] = useState<boolean>(false);
    const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);

    const selectedChapter = chapters.find((c) => c.id === selectedChapterId);

    useEffect(() => {
        getUserChapters()
            .then((data) => setChapters(data))
            .catch((err) => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    const handleStartQuiz = async () => {
        await getChapterQuestions(selectedChapter!.id)
            .then((questions) => setQuestions(questions))
            .finally(() => setIsStarted(true));
    };

    if (isLoading) return <LoadingSpinner message="Loading chapters…" />;

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Quiz</h1>

            {!isStarted ? (
                <div className="max-w-2xl space-y-4">
                    <p className="text-sm text-muted-foreground">Select a chapter to begin practicing.</p>

                    {/* Chapter list */}
                    <div className="flex flex-col gap-2">
                        {chapters.map(ch => {
                            const color = getCategoryColor(ch.category);
                            const isSelected = selectedChapterId === ch.id;
                            return (
                                <button
                                    key={ch.id}
                                    onClick={() => setSelectedChapterId(ch.id)}
                                    className={`flex items-center gap-3 w-full p-3 rounded-xl border-[1.5px] text-left transition-all duration-100 ${
                                        isSelected
                                            ? "border-primary bg-accent"
                                            : "border-border bg-card hover:border-primary/40 hover:bg-accent/50"
                                    }`}
                                >
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color.bg }}>
                                        <span className="text-sm font-bold" style={{ color: color.dot }}>
                                            {ch.title.slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>{ch.title}</p>
                                        <span
                                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                                            style={{ background: color.bg, color: color.text }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color.dot }} />
                                            {ch.category}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={handleStartQuiz}
                        disabled={!selectedChapterId}
                        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Start Quiz
                    </button>
                </div>
            ) : (
                <QuizComponent questions={questions} chapter={selectedChapter} />
            )}
        </div>
    );
}
