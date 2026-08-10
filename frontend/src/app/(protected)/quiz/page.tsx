"use client";
import { Chapter, Question } from "@/lib/types";
import QuizComponent from "@/components/questions/QuizComponent";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getUserChapters } from "@/services/chapters";
import { getChapterQuestions } from "@/services/questions";
import { getCategoryColor } from "@/utils/chapterStyles";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Quiz() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isStarting, setIsStarting] = useState<boolean>(false);
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

    const handleSelectAndStart = async (chapterId: number) => {
        setIsStarting(true);
        setSelectedChapterId(chapterId);
        const chapter = chapters.find(c => c.id === chapterId);
        if (!chapter) return;
        await getChapterQuestions(chapter.id)
            .then((qs) => setQuestions(qs))
            .finally(() => {
                setIsStarting(false);
                setIsStarted(true);
            });
    };

    if (isLoading) return <LoadingSpinner message="Loading chapters…" />;

    if (isStarted && selectedChapter) {
        return (
            <QuizComponent
                questions={questions}
                chapter={selectedChapter}
                onBack={() => { setIsStarted(false); setSelectedChapterId(null); }}
            />
        );
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Quiz</h1>
                <p className="text-sm text-muted-foreground mt-1">Test your knowledge on a chapter</p>
            </div>

            {chapters.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-14 text-center border-[1.5px] border-dashed border-border rounded-xl bg-card">
                    <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-1">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary">
                            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                    </div>
                    <p className="text-sm font-bold text-foreground">No chapters yet</p>
                    <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
                        Upload your notes first, then come back to quiz yourself.
                    </p>
                    <Link href="/upload" className="mt-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                        Upload Notes →
                    </Link>
                </div>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground mb-4">Select a chapter to begin:</p>
                    {isStarting ? (
                        <LoadingSpinner message="Loading questions…" />
                    ) : (
                        <div className="flex flex-col gap-2 max-w-[560px]">
                            {chapters.map(ch => {
                                const color = getCategoryColor(ch.category);
                                return (
                                    <button
                                        key={ch.id}
                                        onClick={() => handleSelectAndStart(ch.id)}
                                        className="flex items-center gap-3 px-4 py-3.5 bg-card border border-border rounded-xl hover:shadow-sm hover:-translate-y-px transition-all text-left"
                                    >
                                        <span
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0"
                                            style={{ background: color.bg, color: color.text }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color.dot }} />
                                            {ch.category}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground">{ch.title}</p>
                                            <p className="text-xs text-muted-foreground">{ch.questions?.length ?? "—"} questions</p>
                                        </div>
                                        <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
