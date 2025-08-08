import React from "react";
import {CHAPTER_COLORS} from "@/utils/chapterStyles";

type Chapter = {
    id: number;
    title: string;
    description: string;
};

function getRandomColor() {
    return CHAPTER_COLORS[Math.floor(Math.random() * CHAPTER_COLORS.length)];
}

type Props = {
    chapter: Chapter;
};

const ChapterCard: React.FC<Props> = ({ chapter }) => {
    const colorClass = getRandomColor();

    return (
        <div className={`rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-100 ${colorClass} text-white`}>
            <h3 className="text-lg font-semibold mb-2">{chapter.title}</h3>
            <p>{chapter.description}</p>
        </div>
    );
};

export default ChapterCard;