import { CHAPTER_COLORS } from "@/utils/chapterStyles";
import { Chapter } from "@/lib/types";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Folder } from "lucide-react";

type ChapterCardProps = {
    chapter: Chapter;
    index: number;
    onClick?: () => void;
    onDeleteIconClick?: (chapter: Chapter) => void;
};

/**
 * ChapterCard component displays a chapter's summary in a styled card.
 * Shows category, title, description, and a delete icon if provided.
 *
 * @component
 * @param {Chapter} chapter - The chapter data to display.
 * @param {number} index - The index of the chapter (for color selection).
 * @param {() => void} [onClick] - Optional handler for card click.
 * @param {(chapter: Chapter) => void} [onDeleteIconClick] - Optional handler for delete icon click.
 */
function ChapterCard({ chapter, index, onClick, onDeleteIconClick }: ChapterCardProps) {
    const colorClass = CHAPTER_COLORS[index % CHAPTER_COLORS.length];
    return (
        <div
            className={`relative rounded-lg shadow hover:shadow-lg transition p-4 border border-gray-100 ${colorClass} text-white ${onClick ? "cursor-pointer" : ""} min-h-[200px] h-full flex flex-col justify-between`}
            style={{ maxHeight: 240 }}
            onClick={onClick}
        >
            {onDeleteIconClick && (
                <button
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 focus:outline-none"
                    title="Delete chapter"
                    onClick={e => {
                        e.stopPropagation();
                        onDeleteIconClick(chapter);
                    }}
                >
                    <TrashIcon className="h-5 w-5 text-white" />
                </button>
            )}

            <div className="flex items-center mb-2">
                <Folder className="w-4 h-4 text-white/80" fill="currentColor" />
                <span className="text-white text-xs font-semibold px-3 py-1 rounded-full max-w-full truncate" title={chapter.category}>
                    {chapter.category}
                </span>
            </div>

            <h3 className="text-l font-bold mb-2 truncate" title={chapter.title}>
                {chapter.title}
            </h3>

            <p className="line-clamp-5 overflow-hidden text-ellipsis text-sm flex-1" title={chapter.description}>{chapter.description}</p>
        </div>
    );
}

export default ChapterCard;