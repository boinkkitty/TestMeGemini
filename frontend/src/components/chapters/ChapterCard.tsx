import { CHAPTER_COLORS } from "@/utils/chapterStyles";
import { Chapter } from "@/lib/types";

type ChapterCardProps = {
    chapter: Chapter;
    index: number;
    onClick?: () => void;
};

function ChapterCard({ chapter, index, onClick }: ChapterCardProps) {
    const colorClass = CHAPTER_COLORS[index % CHAPTER_COLORS.length];
    return (
        <div
            className={`rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-100 ${colorClass} text-white cursor-pointer min-h-[180px] flex flex-col justify-between`}
            onClick={onClick}
        >
            <h3 className="text-lg font-semibold mb-2">{chapter.title}</h3>
            <p className="line-clamp-3 overflow-hidden text-ellipsis flex-1">{chapter.description}</p>
        </div>
    );
}

export default ChapterCard;