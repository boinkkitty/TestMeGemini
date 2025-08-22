"use client";

import { Chapter, Question } from "@/lib/types";
import QuizComponent from "@/components/questions/QuizComponent";
import { useEffect, useState } from "react";
import ChapterSelection from "@/components/chapters/ChapterSelection";
import LoadingSpinner from "@/components/LoadingSpinner";
import {getUserChapters} from "@/services/chapters";
import {getChapterQuestions} from "@/services/questions";

export default function Quiz()  {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserChapters()
            .then((data) => setChapters(data))
            .catch((err) => {
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    const [isStarted, setIsStarted] = useState<boolean>(false);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);

    const handleSelectedChapter = async (chapterId: number) => {
        const chapter = chapters.find(ch => ch.id === chapterId) || null;
        setSelectedChapter(chapter);
        const chapterQuestions = await getChapterQuestions(chapter!.id);
        setQuestions(chapterQuestions);
    };

    if (loading) return <LoadingSpinner message="Loading chapters..." />;

    return (
        <div className="flex flex-col justify-between items-center w-full h-full p-6">
            <div className="flex justify-start items-center p-2 mb-4 w-full">
                <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight underline underline-offset-4 decoration-blue-300 drop-shadow-sm">
                    {selectedChapter && isStarted ? `${selectedChapter.title}` : "Quiz"}
                </h1>
            </div>
            {!isStarted ? (
                <ChapterSelection
                    chapters={chapters}
                    selectedChapterId={selectedChapter?.id}
                    setSelectedChapterId={handleSelectedChapter}
                    handleStart={() => setIsStarted(true)}
                />
            ) : (
                <QuizComponent questions={questions} chapter={selectedChapter} />
            )}
        </div>
    );
}