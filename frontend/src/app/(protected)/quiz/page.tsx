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
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isStarted, setIsStarted] = useState<boolean>(false);
    const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);

    const selectedChapter = chapters.find((c) => c.id === selectedChapterId);
    useEffect(() => {
        getUserChapters()
            .then((data) => setChapters(data))
            .catch((err) => {
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleStartQuiz = async () => {
        await getChapterQuestions(selectedChapter!.id)
            .then((questions) => setQuestions(questions))
            .finally(() => {
                setIsStarted(true);
            });
    }

    if (isLoading) return <LoadingSpinner message="Loading chapters..." />;

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
                    setSelectedChapterId={setSelectedChapterId}
                    handleStart={handleStartQuiz}
                />
            ) : (
                <QuizComponent questions={questions} chapter={selectedChapter} />
            )}
        </div>
    );
}