import React from "react";
import { CHAPTER_COLORS } from "@/utils/chapterStyles";
import { Chapter } from "@/lib/types";

type ChapterCardProps = {
    chapter: Chapter;
    index: number;
    onClick?: () => void;
};

const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, index, onClick }) => {
    const colorClass = CHAPTER_COLORS[index % CHAPTER_COLORS.length];
    return (
        <div
            className={`rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-100 ${colorClass} text-white cursor-pointer`}
            onClick={onClick}
        >
            <h3 className="text-lg font-semibold mb-2">{chapter.title}</h3>
            <p className="line-clamp-3 overflow-hidden text-ellipsis">{chapter.description}</p>
        </div>
    );
};

export default ChapterCard;