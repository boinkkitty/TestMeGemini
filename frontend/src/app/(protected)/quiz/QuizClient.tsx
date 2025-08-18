'use client';

import {Chapter, Question} from "@/lib/types";
import QuizComponent from "@/components/questions/QuizComponent";
import {useState} from "react";
import ChapterSelection from "@/components/chapters/ChapterSelection";
import getChapterQuestions from "@/utils/clientSide/getChapterQuestions";

type QuizClientProps = {
    chapters: Chapter[];
}

export default function QuizClient({ chapters }: QuizClientProps)  {
    // const chapters = dummyChapters;

    const [isStarted, setIsStarted] = useState<boolean>(false);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);

    // Set selectedChapter by id
    const handleSelectedChapter = async (chapterId: number) => {
        const chapter = chapters.find(ch => ch.id === chapterId) || null;
        setSelectedChapter(chapter);
        const chapterQuestions = await getChapterQuestions(chapter!.id);
        console.log(chapterQuestions);
        setQuestions(chapterQuestions);
    };

    // Need to create function call
    // 1. After calling, retrieve questions for chapter
    // 2. Retrieve

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