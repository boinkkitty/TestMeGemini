"use client"

import { useState } from "react";
import {ChapterAttempt, dummyChapterAttempts} from "@/lib/types";
import { ChapterAttemptCard } from "@/components/chapters/ChapterAttemptCard";
import PaginatedQuestionAttempts from "@/components/questions/PaginatedQuestionAttempts";

type AttemptsClientProps = {
    attempts: ChapterAttempt[];
}

function AttemptsClient({attempts}: AttemptsClientProps) {
    const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);

    const handleViewDetails = (attemptId: number) => {
        setSelectedAttemptId(attemptId);
    };

    const handleBack = () => {
        setSelectedAttemptId(null);
    };

    const selectedAttempt = attempts.find(a => a.id === selectedAttemptId);

    return (
        <div className="flex flex-col p-6">
            <div className="flex justify-between items-center p-2 mb-4">
                <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight underline underline-offset-4 decoration-blue-300 drop-shadow-sm">
                    {selectedAttempt ? `${selectedAttempt.title}` : "Chapter Attempts"}
                </h1>
                {/*
                    To add
                    1. SearchBar filter
                    2. Category filter
                */}
            </div>
            {selectedAttempt && (
                <div className="mb-4 flex justify-start">
                    <button onClick={handleBack} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Back</button>
                </div>
            )}
            <div className={selectedAttempt ? "p-2 flex justify-center items-center" : "p-2 flex flex-col gap-2"}>
                {selectedAttempt ? (
                    <PaginatedQuestionAttempts
                        attempts={selectedAttempt.question_attempts || []}
                        onBack={handleBack}
                    />
                ) : (
                    attempts.map((attempt) => (
                        <ChapterAttemptCard
                            key={attempt.id}
                            attempt={attempt}
                            onViewDetails={handleViewDetails}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default AttemptsClient;