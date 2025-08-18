'use client';

import ChapterCard from "@/components/chapters/ChapterCard";
import {Chapter, Question} from "@/lib/types";
import { useState } from "react";
import PaginatedQuestionsForChapter from "@/components/chapters/PaginatedQuestionsForChapter";
import getChapterQuestions from "@/utils/clientSide/getChapterQuestions";

type ChaptersClientProps = {
    chapters: Chapter[];
}

export default function ChaptersClient({chapters}: ChaptersClientProps) {
    const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSelectChapter = async (chapterId: number) => {
        setLoading(true);
        const chapter = chapters.find(ch => ch.id === chapterId) || null;
        const chapterQuestions = await getChapterQuestions(chapter!.id);
        setQuestions(chapterQuestions);
        setSelectedChapterId(chapterId);
        setLoading(false);
    };
    const handleBack = () => {
        setSelectedChapterId(null);
        setQuestions([]);
    }

    const selectedChapter = chapters.find((c) => c.id === selectedChapterId);

    return (
        <div className="flex flex-col p-6">
            <div className="flex justify-start items-center p-2 mb-4">
                <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight underline underline-offset-4 decoration-blue-300 drop-shadow-sm">
                    {selectedChapter ? `${selectedChapter.title}` : "Chapters"}
                </h1>
            </div>
            {selectedChapter && (
                <div className="mb-4 flex justify-start">
                    <button onClick={handleBack} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Back</button>
                </div>
            )}
            <div className={selectedChapterId && selectedChapter ? "p-2 flex justify-center items-center min-h-[60vh]" : "p-2"}>
                {loading ? (
                    <div className="flex items-center justify-center min-h-[40vh] text-lg font-semibold text-blue-600">Loading questions...</div>
                ) : selectedChapterId && selectedChapter ? (
                    <PaginatedQuestionsForChapter questions={questions} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        {chapters.map((chapter, index) => (
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
