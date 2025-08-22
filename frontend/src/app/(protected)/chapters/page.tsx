'use client';

import {useEffect, useState} from "react";
import {Chapter, Question} from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import PaginatedQuestionsForChapter from "@/components/chapters/PaginatedQuestionsForChapter";
import ChapterCard from "@/components/chapters/ChapterCard";
import {getUserChapters} from "@/services/chapters";
import {getChapterQuestions} from "@/services/questions";
import SearchBar from "@/components/ui/SearchBar";
import DropDownSelection from "@/components/ui/DropDownSelection";

export default function Chapters() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(true);
    const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chapterTitleFilter, setChapterTitleFilter] = useState<string>("");
    const [categoryFilter, setCategoryFilter] = useState<string>("");

    const filteredChapters = chapters.filter(chapter =>
        chapter.title.toLowerCase().includes(chapterTitleFilter) &&
        (categoryFilter === "" || chapter.category === categoryFilter)
    );
    const selectedChapter = chapters.find((c) => c.id === selectedChapterId);
    const categoryOptions = Array.from(new Set(chapters.map(a => a.category)))
        .filter(Boolean)
        .map((cat) => ({ value: cat, label: cat }));

    useEffect(() => {
        getUserChapters()
            .then((data) => setChapters(data))
            .catch((err) => {
                console.error(err);
            })
            .finally(() => setIsLoadingChapters(false));
    }, []);

    const handleSelectChapter = async (chapterId: number) => {
        setIsLoading(true);
        const chapter = chapters.find(ch => ch.id === chapterId) || null;
        const chapterQuestions = await getChapterQuestions(chapter!.id);
        setQuestions(chapterQuestions);
        setSelectedChapterId(chapterId);
        setIsLoading(false);
    };

    const handleBack = () => {
        setSelectedChapterId(null);
        setQuestions([]);
    }

    const handleSetChapterTitleFilter = (filter: string) => {
        setChapterTitleFilter(filter.toLowerCase());
    }

    const handleSetCategoryFilter = (filter: string) => {
        setCategoryFilter(filter);
    }

    if (isLoadingChapters) return <LoadingSpinner message="Loading chapters..." />;

    return (
        <div className="flex flex-col p-6">
            <div className="flex justify-start items-center p-2 mb-4">
                <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight underline underline-offset-4 decoration-blue-300 drop-shadow-sm">
                    {selectedChapter ? `${selectedChapter.title}` : "Chapters"}
                </h1>
            </div>
            <div className="flex flex-start gap-6 items-center p-2 mb-4">
                <SearchBar placeholder={"Search title..."} value={chapterTitleFilter} onChange={handleSetChapterTitleFilter}/>
                <DropDownSelection label={"Category"} options={categoryOptions} value={categoryFilter} onChange={handleSetCategoryFilter} showBlankOption={true}/>
            </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        {filteredChapters.map((chapter, index) => (
                            <div key={chapter.id} className="h-full" onClick={() => handleSelectChapter(chapter.id)}>
                                <ChapterCard key={chapter.id} chapter={chapter} index={index} onClick={() => handleSelectChapter(chapter.id)} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}