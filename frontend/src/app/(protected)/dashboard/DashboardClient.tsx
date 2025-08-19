'use client';

import ChapterCard from "@/components/chapters/ChapterCard";
import {Chapter} from "@/lib/types";
import getUserChapters from "@/utils/clientSide/getUserChapters";
import {useEffect, useState} from "react";

type DashboardClientProps = {
    chapters: Chapter[];
}

export default function DashboardClient() {
    const [chapters, setChapters] = useState<Chapter[]>([]);

    useEffect(() => {
        getUserChapters().then(setChapters).catch((err) => {
            console.error(err);
        });
    }, []);

    return (<div className="p-6">
            {/* Top container */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Welcome back!</h1>
                <p className="text-gray-600">Here’s what’s going on...</p>
            </div>

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
