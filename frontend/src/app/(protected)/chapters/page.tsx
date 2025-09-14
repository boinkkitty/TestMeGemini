'use client';

import {useEffect, useState} from "react";
import {Chapter, Question} from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import PaginatedQuestionsForChapter from "@/components/chapters/PaginatedQuestionsForChapter";
import ChapterCard from "@/components/chapters/ChapterCard";
import {deleteChapter, softDeleteChapter} from "@/services/chapters";
import {getUserChapters} from "@/services/chapters";
import {getChapterQuestions} from "@/services/questions";
import SearchBar from "@/components/ui/SearchBar";
import DropDownSelection from "@/components/ui/DropDownSelection";
import DeleteChapterModal from "@/components/chapters/DeleteChapterModal";


/**
 * Chapters Page
 * Displays a list of chapters with filtering, category selection, and question viewing.
 * Allows soft and permanent deletion of chapters.
 *
 * @returns {JSX.Element} The Chapters page UI
 */
export default function Chapters() {
    // State for all chapters
    const [chapters, setChapters] = useState<Chapter[]>([]);
    // Loading state for chapters
    const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(true);
    // Currently selected chapter ID
    const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
    // Questions for the selected chapter
    const [questions, setQuestions] = useState<Question[]>([]);
    // Loading state for questions
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // Filter for chapter title
    const [chapterTitleFilter, setChapterTitleFilter] = useState<string>("");
    // Filter for category
    const [categoryFilter, setCategoryFilter] = useState<string>("");

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [deleteChapterId, setDeleteChapterId] = useState<number | null>(null);
    const [deleteChapterTitle, setDeleteChapterTitle] = useState<string>("");
    const [isPermanentDelete, setIsPermanentDelete] = useState<boolean>(false);

    // Filter chapters by title and category
    const filteredChapters = chapters.filter(chapter =>
        chapter.title.toLowerCase().includes(chapterTitleFilter) &&
        (categoryFilter === "" || chapter.category === categoryFilter)
    );
    // Currently selected chapter object
    const selectedChapter = chapters.find((c) => c.id === selectedChapterId);
    // Category options for dropdown
    const categoryOptions = Array.from(new Set(chapters.map(a => a.category)))
        .filter(Boolean)
        .map((cat) => ({ value: cat, label: cat }))
        .sort((a, b) => a.label.localeCompare(b.label));

    // Fetch chapters on mount
    useEffect(() => {
        getUserChapters()
            .then((data) => setChapters(data))
            .catch((err) => {
                console.error(err);
            })
            .finally(() => setIsLoadingChapters(false));
    }, []);

    /**
     * Handles click on the delete icon for a chapter.
     * Opens the delete modal.
     * @param chapter - The chapter to delete
     */
    const handleDeleteIconClick = (chapter: Chapter) => {
        setDeleteChapterId(chapter.id);
        setDeleteChapterTitle(chapter.title);
        setIsPermanentDelete(false);
        setShowDeleteModal(true);
    };

    /**
     * Handles confirming the deletion of a chapter (soft or permanent).
     */
    const handleConfirmDelete = async () => {
        if (deleteChapterId == null) return;
        try {
            if (isPermanentDelete) {
                await deleteChapter(deleteChapterId);
            } else {
                await softDeleteChapter(deleteChapterId);
            }
            // Only fetch chapters after delete is done
            const data = await getUserChapters();
            setChapters(data);
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setShowDeleteModal(false);
            setIsPermanentDelete(false);
        }
    };

    /**
     * Handles selecting a chapter and fetching its questions.
     * @param chapterId - The ID of the chapter to select
     */
    const handleSelectChapter = async (chapterId: number) => {
        setIsLoading(true);
        setSelectedChapterId(chapterId);
        const chapter = chapters.find(ch => ch.id === chapterId) || null;
        await getChapterQuestions(chapter!.id)
            .then((data) => {
                console.log(data);
                setQuestions(data);
            })
            .finally(() => setIsLoading(false));
    };

    /**
     * Handles going back to the chapters list from the detail view.
     */
    const handleBack = () => {
        setSelectedChapterId(null);
        setQuestions([]);
    }

    /**
     * Sets the chapter title filter (case-insensitive).
     * @param filter - The filter string
     */
    const handleSetChapterTitleFilter = (filter: string) => {
        setChapterTitleFilter(filter.toLowerCase());
    }

    /**
     * Sets the category filter (case-insensitive).
     * @param filter - The filter string
     */
    const handleSetCategoryFilter = (filter: string) => {
        setCategoryFilter(filter);
    }

    if (isLoadingChapters) return <LoadingSpinner message="Loading chapters..." />;

    return (
        <div className="flex flex-col p-6">
            <div className="flex justify-start items-center p-2 mb-4">
                <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight underline underline-offset-4 decoration-blue-300 drop-shadow-sm">
                    {selectedChapter ? `${selectedChapter.category}: ${selectedChapter.title}` : "Chapters"}
                </h1>
            </div>
            {!selectedChapter && (<div className="flex flex-start gap-6 items-center p-2 mb-4">
                <SearchBar placeholder={"Search title..."} value={chapterTitleFilter} onChange={handleSetChapterTitleFilter}/>
                <DropDownSelection label={"Category"} options={categoryOptions} value={categoryFilter} onChange={handleSetCategoryFilter} showBlankOption={true}/>
            </div>)}
            {selectedChapter && (
                <div className="mb-4 flex justify-start">
                    <button onClick={handleBack} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Back</button>
                </div>
            )}
            <div className={selectedChapterId && selectedChapter ? "p-2 flex justify-center items-center min-h-[60vh]" : "p-2"}>
                {isLoading ? (
                    <LoadingSpinner message="Loading questions..." />
                ) : selectedChapterId && selectedChapter ? (
                    <PaginatedQuestionsForChapter questions={questions} />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {filteredChapters.map((chapter, index) => (
                                <div key={chapter.id} className="h-full" onClick={() => handleSelectChapter(chapter.id)}>
                                    <ChapterCard
                                        chapter={chapter}
                                        index={index}
                                        onClick={() => handleSelectChapter(chapter.id)}
                                        onDeleteIconClick={handleDeleteIconClick}
                                    />
                                </div>
                            ))}
                        </div>
                        <DeleteChapterModal
                            open={showDeleteModal}
                            onClose={() => setShowDeleteModal(false)}
                            onConfirm={handleConfirmDelete}
                            chapterTitle={deleteChapterTitle}
                            isDeleteAttempts={isPermanentDelete}
                            setDeleteAttempts={setIsPermanentDelete}
                        />
                    </>
                )}
            </div>
        </div>
    );
}