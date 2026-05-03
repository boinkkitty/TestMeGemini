"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ChapterAttempt, QuestionAttempt } from "@/lib/types";
import { ChapterAttemptCard } from "@/components/attempts/ChapterAttemptCard";
import PaginatedQuestionAttempts from "@/components/attempts/PaginatedQuestionAttempts";
import { getChapterAttempt, getUserChapterAttempts } from "@/services/attempts";
import SearchBar from "@/components/ui/SearchBar";
import DropDownSelection from "@/components/ui/DropDownSelection";
import { ClockIcon } from "lucide-react";

type SortType = "latest" | "oldest" | "highest" | "lowest";

export default function Attempts() {
    const [attempts, setAttempts] = useState<ChapterAttempt[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
    const [selectedAttempt, setSelectedAttempt] = useState<ChapterAttempt | null>(null);
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

    const categoryOptions = Array.from(new Set(attempts.map(a => a.category)))
        .filter(Boolean)
        .map((cat) => ({ value: cat, label: cat }))
        .sort((a, b) => a.label.localeCompare(b.label));

    const handleSelectAttempt = async (attemptId: number) => {
        const attempt = attempts.find((a) => a.id === attemptId);
        if (!attempt) return;
        setIsLoadingDetail(true);
        setSelectedAttempt(attempt);
        await getChapterAttempt(attempt.id).then((data) => {
            setQuestionAttempts(data.question_attempts ?? []);
        }).finally(() => setIsLoadingDetail(false));
    };

    const handleBack = () => {
        setSelectedAttempt(null);
        setQuestionAttempts([]);
    };

    useEffect(() => {
        getUserChapterAttempts()
            .then((data) => setAttempts(data))
            .catch((err) => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <LoadingSpinner message="Loading attempts…" />;

    // Detail view — full-page layout (no p-8 wrapper)
    if (selectedAttempt) {
        if (isLoadingDetail) return <LoadingSpinner message="Loading attempt…" />;
        if (questionAttempts.length > 0) {
            return (
                <PaginatedQuestionAttempts
                    attempts={questionAttempts}
                    attempt={selectedAttempt}
                    onBack={handleBack}
                />
            );
        }
        return (
            <div className="p-8">
                <button onClick={handleBack} className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4">
                    ← Back
                </button>
                <p className="text-sm text-muted-foreground">No question attempts found.</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Attempts</h1>
                <p className="text-sm text-muted-foreground mt-1">All your past quiz attempts</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <SearchBar placeholder="Search title…" value={chapterTitleFilter} onChange={(v) => setChapterTitleFilter(v.toLowerCase())} />
                <DropDownSelection label="Category" options={categoryOptions} value={categoryFilter} onChange={setCategoryFilter} showBlankOption={true} />
                <DropDownSelection label="Sort By" options={SORT_OPTIONS} value={sortBy} onChange={(v) => setSortBy(v as SortType)} showBlankOption={false} />
            </div>

            {/* List */}
            <div className="flex flex-col gap-2">
                {filteredAttempts.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-14 text-center border-[1.5px] border-dashed border-border rounded-xl bg-card">
                        <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-1">
                            <ClockIcon size={22} className="text-primary" strokeWidth={1.8} />
                        </div>
                        <p className="text-sm font-bold text-foreground">
                            {attempts.length === 0 ? "No attempts yet" : "No attempts match your filters"}
                        </p>
                        <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
                            {attempts.length === 0 ? "Complete a quiz to see your results here." : "Try adjusting the search, category, or sort filters."}
                        </p>
                    </div>
                ) : (
                    filteredAttempts.map((attempt) => (
                        <ChapterAttemptCard
                            key={attempt.id}
                            attempt={attempt}
                            onViewDetails={handleSelectAttempt}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
