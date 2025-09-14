"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ChapterAttempt, QuestionAttempt } from "@/lib/types";
import { ChapterAttemptCard } from "@/components/attempts/ChapterAttemptCard";
import PaginatedQuestionAttempts from "@/components/attempts/PaginatedQuestionAttempts";
import {getChapterAttempt, getUserChapterAttempts} from "@/services/attempts";
import SearchBar from "@/components/ui/SearchBar";
import DropDownSelection from "@/components/ui/DropDownSelection";

type SortType = "latest" | "oldest" | "highest" | "lowest";

/**
 * Attempts Page
 * Displays a list of chapter attempts with filtering, sorting, and detail view.
 *
 * @returns {JSX.Element} The Attempts page UI
 */
export default function Attempts() {
    // State for all attempts
    const [attempts, setAttempts] = useState<ChapterAttempt[]>([]);
    // Loading state
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Currently selected attempt ID
    const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
    // Question attempts for the selected attempt
    const [questionAttempts, setQuestionAttempts] = useState<QuestionAttempt[]>([]);
    // Filter for chapter title
    const [chapterTitleFilter, setChapterTitleFilter] = useState<string>("");
    // Filter for category
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    // Sorting type
    const [sortBy, setSortBy] = useState<SortType>("latest");

    /**
     * Sorting options for the dropdown
     */
    const SORT_OPTIONS = [
        { value: "latest", label: "Latest" },
        { value: "oldest", label: "Oldest" },
        { value: "highest", label: "Highest Score" },
        { value: "lowest", label: "Lowest Score" },
    ];

    // Filtered and sorted attempts
    let filteredAttempts = attempts.filter(attempt =>
        attempt.title.toLowerCase().includes(chapterTitleFilter) &&
        (categoryFilter === "" || attempt.category === categoryFilter)
    );

    // Sorting logic using switch
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
        default:
            break;
    }
    const selectedAttempt = attempts.find(a => a.id === selectedAttemptId);
    const categoryOptions = Array.from(new Set(attempts.map(a => a.category)))
        .filter(Boolean)
        .map((cat) => ({ value: cat, label: cat }))
        .sort((a, b) => a.label.localeCompare(b.label));

    /**
     * Handles selecting an attempt and fetching its question attempts.
     * @param attemptId - The ID of the attempt to select
     */
    const handleSelectAttempt = async (attemptId: number) => {
        setIsLoading(true);
        setSelectedAttemptId(attemptId);
        const attempt = attempts.find((attempt) => attempt.id === attemptId);
        await getChapterAttempt(attempt!.id).then((data) => {
            setQuestionAttempts(data.question_attempts ?? []);
        }).finally(() => setIsLoading(false));
    };

    /**
     * Handles going back to the attempts list from the detail view.
     */
    const handleBack = () => {
        setSelectedAttemptId(null);
        setQuestionAttempts([]);
    };

    /**
     * Sets the chapter title filter (case-insensitive).
     * @param filter - The filter string
     */
    const handleSetChapterTitleFilter = (filter: string) => {
        setChapterTitleFilter(filter.toLowerCase());
    }

    /**
     * Sets the category filter.
     * @param filter - The category string
     */
    const handleSetCategoryFilter = (filter: string) => {
        setCategoryFilter(filter);
    }

    /**
     * Sets the sorting type.
     * @param sortValue - The sorting value
     */
    const handleSortBy = (sortValue: string) => {
        setSortBy(sortValue as SortType);
    }
    
    useEffect(() => {
        getUserChapterAttempts()
            .then((data) => setAttempts(data))
            .catch((err) => {
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        console.log(attempts);
    }, [attempts]);

    if (isLoading) return <LoadingSpinner message="Loading attempts..." />;

    return (
        <div className="flex flex-col p-6">
            <div className="flex justify-between items-center p-2 mb-4">
                <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight underline underline-offset-4 decoration-blue-300 drop-shadow-sm">
                    {selectedAttempt ? `${selectedAttempt.category}: ${selectedAttempt.title}` : "Chapter Attempts"}
                </h1>
            </div>
            {!selectedAttempt && (
                <div className="flex flex-start gap-6 items-center p-2 mb-2">
                    <SearchBar placeholder={"Search title..."} value={chapterTitleFilter} onChange={handleSetChapterTitleFilter}/>
                    <DropDownSelection label={"Category"} options={categoryOptions} value={categoryFilter} onChange={handleSetCategoryFilter} showBlankOption={true}/>
                    <DropDownSelection label={"Sort By"} options={SORT_OPTIONS} value={sortBy} onChange={handleSortBy} showBlankOption={false}/>
                </div>
            )}
            {selectedAttempt ? (
                <>
                    <div className="mb-4 flex justify-start">
                        <button onClick={handleBack} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Back</button>
                    </div>
                    <div className="p-2 flex justify-center items-center">
                        {questionAttempts && questionAttempts.length > 0 ? (
                            <PaginatedQuestionAttempts attempts={questionAttempts} />
                        ) : (
                            <div className="text-gray-500 text-center">No question attempts found for this attempt.</div>
                        )}
                    </div>
                </>
            ) : (
                <div className="p-2 flex flex-col gap-2">
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