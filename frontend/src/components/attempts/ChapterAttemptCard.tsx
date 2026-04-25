"use client";
import { ChapterAttempt } from "@/lib/types";
import { getCategoryColor } from "@/utils/chapterStyles";

type ChapterAttemptCardProps = {
    attempt: ChapterAttempt;
    onViewDetails: (attemptId: number) => void;
};

export function ChapterAttemptCard({ attempt, onViewDetails }: ChapterAttemptCardProps) {
    const formattedDate = new Date(attempt.completed_at).toLocaleDateString('en-GB');
    const pct = attempt.max_score ? Math.round((attempt.score / attempt.max_score) * 100) : 0;
    const color = getCategoryColor(attempt.category);
    const badgeColor = pct >= 70
        ? "bg-green-100 text-green-700"
        : pct >= 40
        ? "bg-orange-100 text-orange-700"
        : "bg-red-100 text-red-700";

    return (
        <div className="flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-3 hover:shadow-sm transition-all">
            {/* Score ring */}
            <div
                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-extrabold text-sm"
                style={{ background: color.bg, color: color.dot }}
            >
                {pct}%
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{attempt.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: color.bg, color: color.text }}
                    >
                        <span className="w-1 h-1 rounded-full" style={{ background: color.dot }} />
                        {attempt.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{formattedDate}</span>
                    <span className="text-xs text-muted-foreground">{attempt.score}/{attempt.max_score} correct</span>
                </div>
            </div>

            {/* Badge + action */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>
                    {pct >= 70 ? "Great" : pct >= 40 ? "Decent" : "Retry"}
                </span>
                <button
                    className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    onClick={() => onViewDetails(attempt.id)}
                >
                    View →
                </button>
            </div>
        </div>
    );
}
