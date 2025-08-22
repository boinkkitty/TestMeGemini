"use client";
import ChapterCard from "@/components/chapters/ChapterCard";
import { Chapter } from "@/lib/types";
import getUserChapters from "@/utils/clientSide/getUserChapters";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Dashboard() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        getUserChapters()
            .then((data) => setChapters(data))
            .catch((err) => {
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner message="Loading chapters..." />;

    return (
        <div className="p-6">
            {/* Top container */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Welcome back!</h1>
                <p className="text-gray-600">Here’s what’s going on...</p>
            </div>
            {/* 5-column grid for chapters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {chapters.map((chapter, index) => (
                    <ChapterCard key={chapter.id} chapter={chapter} index={index} />
                ))}
            </div>
        </div>
    );
}