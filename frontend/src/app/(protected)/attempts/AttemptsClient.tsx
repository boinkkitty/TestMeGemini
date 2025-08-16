"use client"

import {dummyChapterAttempts} from "@/lib/types";
import { ChapterAttemptCard } from "@/components/chapters/ChapterAttemptCard";

function AttemptsClient() {
    const attempts = dummyChapterAttempts;

    const handleViewDetails = (attemptId: number) => {
        // TODO: fetch and render question attempt cards for the selected chapter attempt
        alert(`View details for attempt ID: ${attemptId}`);
    };

    return (
        <div className="flex flex-col p-6">
            <div className="flex justify-between p-2">
                <h1>Chapter Attempts</h1>
                {/*
                    To add
                    1. SearchBar filter
                    2. Category filter
                */}
            </div>
            <div className="p-2">
                {attempts.map((attempt) => (
                    <ChapterAttemptCard
                        key={attempt.id}
                        attempt={attempt}
                        onViewDetails={handleViewDetails}
                    />
                ))}
            </div>
        </div>
    );
}

export default AttemptsClient;