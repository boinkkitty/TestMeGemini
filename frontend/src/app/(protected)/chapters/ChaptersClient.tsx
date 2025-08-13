'use client';

import ChapterCard from "@/components/chapters/ChapterCard";
import {Chapter, dummyChapters} from "@/lib/types";

type ChaptersClientProps = {
    // chapters: Chapter[];
}

export default function ChaptersClient() {
    const chapters: Chapter[] = dummyChapters;

    return (<div className="p-6">
            {/* Top container
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Welcome back!</h1>
                    <p className="text-gray-600">Here’s what’s going on...</p>
                </div>

             */}


            {/* 5-column grid for chapters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Example chapters */}
                {chapters.map((chapter, index) => (
                    <ChapterCard key={chapter.id} chapter={chapter} index={index}/>
                ))}
                {/* Add more chapters as needed */}
            </div>
        </div>
    )
}
