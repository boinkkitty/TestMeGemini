"use client";
import ChapterCard from "@/components/chapters/ChapterCard";
import {Chapter, UserInfo} from "@/lib/types";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import {getUserChapters} from "@/services/chapters";
import {getUserInfo} from "@/services/users";

export default function Dashboard() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
        getUserInfo()
            .then((data) => setUserInfo(data))
            .catch((err) => console.error(err));
        getUserChapters()
            .then((data) => setChapters(data))
            .catch((err) => {
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <LoadingSpinner message="Loading chapters..." />;

    return (
        <div className="p-6">
            {/* Top container */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold">
                    {`Welcome back ${userInfo?.username ?? ""}!`}
                </h1>
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