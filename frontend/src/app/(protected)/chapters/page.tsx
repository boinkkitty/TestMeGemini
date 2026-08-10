'use client';

import { useEffect, useState } from "react";
import { Chapter, Question } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import PaginatedQuestionsForChapter from "@/components/chapters/PaginatedQuestionsForChapter";
import ChapterCard from "@/components/chapters/ChapterCard";
import { deleteChapter } from "@/services/chapters";
import { getUserChapters } from "@/services/chapters";
import { getChapterQuestions } from "@/services/questions";
import SearchBar from "@/components/ui/SearchBar";
import DropDownSelection from "@/components/ui/DropDownSelection";
import DeleteChapterModal from "@/components/chapters/DeleteChapterModal";
import { getCategoryColor } from "@/utils/chapterStyles";
import { useRouter } from "next/navigation";

export default function Chapters() {
    const router = useRouter();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(true);
    const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chapterTitleFilter, setChapterTitleFilter] = useState<string>("");
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [deleteChapterId, setDeleteChapterId] = useState<number | null>(null);
    const [deleteChapterTitle, setDeleteChapterTitle] = useState<string>("");

    const filteredChapters = chapters.filter(chapter =>
        chapter.title.toLowerCase().includes(chapterTitleFilter) &&
        (categoryFilter === "" || chapter.category === categoryFilter)
    );
    const selectedChapter = chapters.find((c) => c.id === selectedChapterId);
    const categoryOptions = Array.from(new Set(chapters.map(a => a.category)))
        .filter(Boolean)
        .map((cat) => ({ value: cat, label: cat }))
        .sort((a, b) => a.label.localeCompare(b.label));

    useEffect(() => {
        getUserChapters()
            .then((data) => setChapters(data))
            .catch((err) => console.error(err))
            .finally(() => setIsLoadingChapters(false));
    }, []);

    const handleDeleteIconClick = (chapter: Chapter) => {
        setDeleteChapterId(chapter.id);
        setDeleteChapterTitle(chapter.title);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (deleteChapterId == null) return;
        try {
            await deleteChapter(deleteChapterId);
            const data = await getUserChapters();
            setChapters(data);
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleSelectChapter = async (chapterId: number) => {
        setIsLoading(true);
        setSelectedChapterId(chapterId);
        const chapter = chapters.find(ch => ch.id === chapterId) || null;
        await getChapterQuestions(chapter!.id)
            .then((data) => setQuestions(data))
            .finally(() => setIsLoading(false));
    };

    const handleBack = () => {
        setSelectedChapterId(null);
        setQuestions([]);
    };

    if (isLoadingChapters) return <LoadingSpinner message="Loading chapters…" />;

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    {selectedChapter ? (
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                {(() => {
                                    const color = getCategoryColor(selectedChapter.category);
                                    return (
                                        <span
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                                            style={{ background: color.bg, color: color.text }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color.dot }} />
                                            {selectedChapter.category}
                                        </span>
                                    );
                                })()}
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">{selectedChapter.title}</h1>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold tracking-tight">Chapters</h1>
                            <p className="text-sm text-muted-foreground mt-1">Browse and manage your uploaded study materials</p>
                        </>
                    )}
                </div>
                {selectedChapter && (
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    >
                        ← Back
                    </button>
                )}
            </div>

            {/* Filters (list view only) */}
            {!selectedChapter && (
                <div className="flex items-center gap-4">
                    <SearchBar placeholder="Search title…" value={chapterTitleFilter} onChange={(v) => setChapterTitleFilter(v.toLowerCase())} />
                    <DropDownSelection label="Category" options={categoryOptions} value={categoryFilter} onChange={setCategoryFilter} showBlankOption={true} />
                </div>
            )}

            {/* Content */}
            <div>
                {isLoading ? (
                    <LoadingSpinner message="Loading questions…" />
                ) : selectedChapterId && selectedChapter ? (
                    <div className="flex justify-center">
                        <PaginatedQuestionsForChapter questions={questions} />
                    </div>
                ) : (
                    <>
                        {filteredChapters.length === 0 && (
                            <div className="flex flex-col items-center gap-3 py-14 text-center border-[1.5px] border-dashed border-border rounded-xl bg-card mb-4">
                                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-1">
                                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                    </svg>
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                    {chapters.length === 0 ? "No chapters yet" : "No chapters match your filters"}
                                </p>
                                <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
                                    {chapters.length === 0 ? "Upload your notes to get started." : "Try adjusting the search or category filter."}
                                </p>
                                {chapters.length === 0 && (
                                    <a href="/upload" className="mt-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                                        Upload Notes →
                                    </a>
                                )}
                            </div>
                        )}
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                            {filteredChapters.map((chapter) => (
                                <ChapterCard
                                    key={chapter.id}
                                    chapter={chapter}
                                    onClick={() => handleSelectChapter(chapter.id)}
                                    onQuiz={() => router.push("/quiz")}
                                    onDeleteIconClick={handleDeleteIconClick}
                                />
                            ))}
                        </div>
                        <DeleteChapterModal
                            open={showDeleteModal}
                            onClose={() => setShowDeleteModal(false)}
                            onConfirm={handleConfirmDelete}
                            chapterTitle={deleteChapterTitle}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
