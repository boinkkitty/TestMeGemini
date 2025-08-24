import { CHAPTER_COLORS } from "@/utils/chapterStyles";
import { Chapter } from "@/lib/types";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

type ChapterCardProps = {
    chapter: Chapter;
    index: number;
    onClick?: () => void;
    onDeleteIconClick?: (chapter: Chapter) => void;
};

function ChapterCard({ chapter, index, onClick, onDeleteIconClick }: ChapterCardProps) {
    const colorClass = CHAPTER_COLORS[index % CHAPTER_COLORS.length];
    return (
        <div
            className={`relative rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-100 ${colorClass} text-white ${onClick ? "cursor-pointer" : ""} min-h-[200px] h-full flex flex-col justify-between`}
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

            <h3 className="text-lg font-semibold mb-2 truncate" title={chapter.title}>{chapter.title}</h3>
            <p className="line-clamp-3 overflow-hidden text-ellipsis text-sm flex-1" title={chapter.description}>{chapter.description}</p>
        </div>
    );
}

export default ChapterCard;