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

    const r = 18;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    return (
        <div
            className="flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-3 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onViewDetails(attempt.id)}
        >
            {/* SVG ring score indicator */}
            <div className="relative w-11 h-11 flex-shrink-0">
                <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: "rotate(-90deg)" }}>
                    <circle
                        cx="22" cy="22" r={r}
                        fill="none" stroke="var(--border)" strokeWidth="4"
                    />
                    <circle
                        cx="22" cy="22" r={r}
                        fill="none" stroke="var(--primary)" strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground">
                    {pct}%
                </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{attempt.title}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
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

            {/* Badge */}
            <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${badgeColor}`}>
                {pct >= 70 ? "Great" : pct >= 40 ? "Decent" : "Retry"} →
            </span>
        </div>
    );
}
