'use client';

import {useEffect, useState} from "react";
import {ChapterAttempt, QuestionAttempt} from "@/lib/types";
import { ChapterAttemptCard } from "@/components/chapters/ChapterAttemptCard";
import PaginatedQuestionAttempts from "@/components/questions/PaginatedQuestionAttempts";
import getChapterAttempt from "@/utils/clientSide/getChapterAttempt";
import getUserChapterAttempts from "@/utils/clientSide/getUserChapterAttempts";
import getUserChapters from "@/utils/clientSide/getUserChapters";
import {useRouter} from "next/navigation";

type AttemptsClientProps = {
    attempts: ChapterAttempt[];
}

function AttemptsClient() {
    const [attempts, setAttempts] = useState<ChapterAttempt[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const res = await getUserChapterAttempts();
                setAttempts(res); // update state
            } catch (err) {
                console.error(err);
                // Redirect to login if fetching fails
                router.push("/login");
            }
        };

        fetchChapters();
    }, [router]);

    const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
    const [questionAttempts, setQuestionAttempts] = useState<QuestionAttempt[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSelectAttempt = async (attemptId: number) => {
        setLoading(true);
        setSelectedAttemptId(attemptId);
        const attempt = attempts.find((attempt) => attempt.id === attemptId);
        const attemptDetails = await getChapterAttempt(attempt!.id);
        setQuestionAttempts(attemptDetails.question_attempts ?? []);
        setLoading(false);
    };

    const handleBack = () => {
        setSelectedAttemptId(null);
        setQuestionAttempts([]);
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
            {loading ? (
                <div className="flex items-center justify-center min-h-[40vh] text-lg font-semibold text-blue-600">Loading...</div>
            ) : (
                <>
                    {selectedAttempt && (
                        <div className="mb-4 flex justify-start">
                            <button onClick={handleBack} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Back</button>
                        </div>
                    )}
                    <div className={selectedAttempt ? "p-2 flex justify-center items-center" : "p-2 flex flex-col gap-2"}>
                        {selectedAttempt ? (
                            (questionAttempts && questionAttempts.length > 0) ? (
                                <PaginatedQuestionAttempts
                                    attempts={questionAttempts}
                                />
                            ) : (
                                <div className="text-gray-500 text-center">No question attempts found for this attempt.</div>
                            )
                        ) : (
                            attempts.map((attempt) => (
                                <ChapterAttemptCard
                                    key={attempt.id}
                                    attempt={attempt}
                                    onViewDetails={handleSelectAttempt}
                                />
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default AttemptsClient;