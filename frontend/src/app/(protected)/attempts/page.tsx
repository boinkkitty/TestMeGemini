"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ChapterAttempt, QuestionAttempt } from "@/lib/types";
import { ChapterAttemptCard } from "@/components/attempts/ChapterAttemptCard";
import PaginatedQuestionAttempts from "@/components/attempts/PaginatedQuestionAttempts";
import { getChapterAttempt, getUserChapterAttempts } from "@/services/attempts";
import SearchBar from "@/components/ui/SearchBar";
import DropDownSelection from "@/components/ui/DropDownSelection";
import { getCategoryColor } from "@/utils/chapterStyles";

type SortType = "latest" | "oldest" | "highest" | "lowest";

export default function Attempts() {
    const [attempts, setAttempts] = useState<ChapterAttempt[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
    const [questionAttempts, setQuestionAttempts] = useState<QuestionAttempt[]>([]);
    const [chapterTitleFilter, setChapterTitleFilter] = useState<string>("");
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortType>("latest");

    const SORT_OPTIONS = [
        { value: "latest", label: "Latest" },
        { value: "oldest", label: "Oldest" },
        { value: "highest", label: "Highest Score" },
        { value: "lowest", label: "Lowest Score" },
    ];

    let filteredAttempts = attempts.filter(attempt =>
        attempt.title.toLowerCase().includes(chapterTitleFilter) &&
        (categoryFilter === "" || attempt.category === categoryFilter)
    );

    switch (sortBy) {
        case "latest":
            filteredAttempts = filteredAttempts.slice().sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
            break;
        case "oldest":
            filteredAttempts = filteredAttempts.slice().sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
            break;
        case "highest":
            filteredAttempts = filteredAttempts.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
            break;
        case "lowest":
            filteredAttempts = filteredAttempts.slice().sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
            break;
    }

    const selectedAttempt = attempts.find(a => a.id === selectedAttemptId);
    const categoryOptions = Array.from(new Set(attempts.map(a => a.category)))
        .filter(Boolean)
        .map((cat) => ({ value: cat, label: cat }))
        .sort((a, b) => a.label.localeCompare(b.label));

    const handleSelectAttempt = async (attemptId: number) => {
        setIsLoading(true);
        setSelectedAttemptId(attemptId);
        const attempt = attempts.find((attempt) => attempt.id === attemptId);
        await getChapterAttempt(attempt!.id).then((data) => {
            setQuestionAttempts(data.question_attempts ?? []);
        }).finally(() => setIsLoading(false));
    };

    const handleBack = () => {
        setSelectedAttemptId(null);
        setQuestionAttempts([]);
    };

    useEffect(() => {
        getUserChapterAttempts()
            .then((data) => setAttempts(data))
            .catch((err) => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <LoadingSpinner message="Loading attempts…" />;

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    {selectedAttempt ? (
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                {(() => {
                                    const color = getCategoryColor(selectedAttempt.category);
                                    return (
                                        <span
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                                            style={{ background: color.bg, color: color.text }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color.dot }} />
                                            {selectedAttempt.category}
                                        </span>
                                    );
                                })()}
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">{selectedAttempt.title}</h1>
                        </>
                    ) : (
                        <h1 className="text-2xl font-bold tracking-tight">Attempts</h1>
                    )}
                </div>
                {selectedAttempt && (
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    >
                        ← Back
                    </button>
                )}
            </div>

            {/* Filters */}
            {!selectedAttempt && (
                <div className="flex items-center gap-4">
                    <SearchBar placeholder="Search title…" value={chapterTitleFilter} onChange={(v) => setChapterTitleFilter(v.toLowerCase())} />
                    <DropDownSelection label="Category" options={categoryOptions} value={categoryFilter} onChange={setCategoryFilter} showBlankOption={true} />
                    <DropDownSelection label="Sort By" options={SORT_OPTIONS} value={sortBy} onChange={(v) => setSortBy(v as SortType)} showBlankOption={false} />
                </div>
            )}

            {/* Content */}
            {selectedAttempt ? (
                <div className="flex justify-center">
                    {questionAttempts && questionAttempts.length > 0 ? (
                        <PaginatedQuestionAttempts attempts={questionAttempts} />
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No question attempts found for this attempt.</p>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filteredAttempts.length === 0 && (
                        <div className="flex flex-col items-center gap-3 py-16 text-center border border-border rounded-xl bg-card">
                            <p className="text-sm font-semibold text-foreground">
                                {attempts.length === 0 ? "No attempts yet" : "No attempts match your filters"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {attempts.length === 0 ? "Complete a quiz to see your results here." : "Try adjusting the search, category, or sort filters."}
                            </p>
                        </div>
                    )}
                    {filteredAttempts.map((attempt) => (
                        <ChapterAttemptCard
                            key={attempt.id}
                            attempt={attempt}
                            onViewDetails={handleSelectAttempt}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
