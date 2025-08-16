'use client';

import ChapterCard from "@/components/chapters/ChapterCard";
import {Chapter, dummyChapters, dummyQuestions} from "@/lib/types";
import { useState } from "react";
import PaginatedQuestionsForChapter from "@/components/chapters/PaginatedQuestionsForChapter";

type ChaptersClientProps = {
    // chapters: Chapter[];
}

export default function ChaptersClient() {
    const chapters: Chapter[] = dummyChapters;
    const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);

    const handleSelectChapter = (chapterId: number) => {
        setSelectedChapterId(chapterId);
    };
    const handleBack = () => setSelectedChapterId(null);

    const selectedChapter = chapters.find((c) => c.id === selectedChapterId);
    const questions = dummyQuestions.filter(q => q.chapter === selectedChapterId);

    return (
        <div className="flex flex-col p-6">
            <div className="flex justify-between items-center p-2 mb-4">
                <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight underline underline-offset-4 decoration-blue-300 drop-shadow-sm">
                    {selectedChapter ? `Chapter ${selectedChapterId}` : "Chapter Attempts"}
                </h1>
            </div>
            {selectedChapter && (
                <div className="mb-4 flex justify-start">
                    <button onClick={handleBack} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Back</button>
                </div>
            )}
            <div className={selectedChapterId && selectedChapter ? "p-2 flex justify-center items-center min-h-[60vh]" : "p-2"}>
                {selectedChapterId && selectedChapter ? (
                    <PaginatedQuestionsForChapter questions={questions} onBack={handleBack} />
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
