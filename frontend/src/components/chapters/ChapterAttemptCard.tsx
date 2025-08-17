"use client"
import { ChapterAttempt } from "@/lib/types";

type ChapterAttemptCardProps = {
    attempt: ChapterAttempt;
    onViewDetails: (attemptId: number) => void;
};

export const ChapterAttemptCard = ({ attempt, onViewDetails }: ChapterAttemptCardProps) => {
    // Format date as dd/mm/yy
    const formattedDate = new Date(attempt.attempted_at).toLocaleDateString('en-GB');
    return (
        <div className="border rounded p-2 px-6 mb-2 flex flex-row items-center justify-between shadow bg-white text-xs">
            <div className="flex flex-1 flex-row items-center justify-between gap-2">
                <div className="flex-1">
                    <div className="font-bold text-[11px] text-gray-700">Title:</div>
                    <div className="text-sm">{attempt.title}</div>
                </div>
                <div className="flex-1">
                    <div className="font-bold text-[11px] text-gray-700">Score:</div>
                    <div className="text-sm">{attempt.score} / {attempt.order.length}</div>
                </div>
                <div className="flex-1">
                    <div className="font-bold text-[11px] text-gray-700">Attempted On:</div>
                    <div className="text-sm">{formattedDate}</div>
                </div>
            </div>
            <button
                className="ml-4 px-5 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold whitespace-nowrap"
                onClick={() => onViewDetails(attempt.id)}
            >
                View Details
            </button>
        </div>
    );
}