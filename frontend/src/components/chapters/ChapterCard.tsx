import { getCategoryColor } from "@/utils/chapterStyles";
import { Chapter } from "@/lib/types";
import { Trash2, BookOpenIcon } from "lucide-react";

type ChapterCardProps = {
    chapter: Chapter;
    index?: number;
    onClick?: () => void;
    onQuiz?: () => void;
    onDeleteIconClick?: (chapter: Chapter) => void;
};

function ChapterCard({ chapter, onClick, onQuiz, onDeleteIconClick }: ChapterCardProps) {
    const color = getCategoryColor(chapter.category);

    return (
        <div className="relative bg-card rounded-xl border border-border p-4 flex flex-col gap-3 min-h-[180px] h-full transition-all duration-150 hover:shadow-md hover:-translate-y-px">
            {/* Top row: category badge + delete */}
            <div className="flex items-center justify-between">
                <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: color.bg, color: color.text }}
                >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color.dot }} />
                    {chapter.category}
                </span>
                {onDeleteIconClick && (
                    <button
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete chapter"
                        onClick={e => { e.stopPropagation(); onDeleteIconClick(chapter); }}
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-bold tracking-tight text-foreground leading-snug truncate">
                {chapter.title}
            </h3>

            {/* Description */}
            <p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                {chapter.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                    <BookOpenIcon size={12} />
                    <span>{chapter.questions?.length ?? "—"} questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {onClick && (
                        <button
                            onClick={e => { e.stopPropagation(); onClick(); }}
                            className="px-2.5 py-1 text-xs font-semibold border border-border rounded-md text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                        >
                            Browse
                        </button>
                    )}
                    {onQuiz && (
                        <button
                            onClick={e => { e.stopPropagation(); onQuiz(); }}
                            className="px-2.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                            Quiz →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChapterCard;
