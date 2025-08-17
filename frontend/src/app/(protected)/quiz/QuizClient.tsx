'use client';

import {Chapter, dummyChapters, dummyQuestions, Question} from "@/lib/types";
import PaginatedQuestions from "@/components/questions/PaginatedQuestions";
import QuizComponent from "@/components/questions/QuizComponent";
import {useState} from "react";
import ChapterSelection from "@/components/chapters/ChapterSelection";
import getChapterQuestions from "@/utils/clientSide/getChapterQuestions";

type QuizClientProps = {
    chapters: Chapter[];
}

export default function QuizClient({ chapters }: QuizClientProps)  {
    // const chapters = dummyChapters;

    const [isStarted, setIsStarted] = useState(false);
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
        <div className="flex justify-center items-center w-full h-full">
            {/*<PaginatedQuestions questions={dummyQuestions} onSubmit={() => {}}/>*/}
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