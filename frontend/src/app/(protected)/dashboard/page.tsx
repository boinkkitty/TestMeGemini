"use client";
import { useEffect, useState } from "react";
import ChapterCard from "@/components/chapters/ChapterCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Chapter, UserInfo, ChapterAttempt } from "@/lib/types";
import { getUserInfo } from "@/services/users";
import { getLatestChapters } from "@/services/chapters";
import { getUserActivity, getWeeklyStats, getRecentChapterAttempts, ActivityDay, WeeklyStats } from "@/services/attempts";

export default function Dashboard() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [activity, setActivity] = useState<ActivityDay[]>([]);
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
    const [recentAttempts, setRecentAttempts] = useState<ChapterAttempt[]>([]);

    useEffect(() => {
        setIsLoading(true);

        Promise.all([
            getUserInfo().catch(() => null),
            getLatestChapters(6).catch(() => []),
            getUserActivity(7).catch(() => []),
            getWeeklyStats().catch(() => null),
            getRecentChapterAttempts(10).catch(() => []),
        ]).then(([userInfoData, chaptersData, activityData, weeklyStatsData, recentAttemptsData]) => {
            if (userInfoData) setUserInfo(userInfoData);
            setChapters(chaptersData);
            setActivity(activityData);
            setWeeklyStats(weeklyStatsData);
            setRecentAttempts(recentAttemptsData);
        }).finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">
                    {`Welcome back ${userInfo?.username ?? ""}!`}
                </h1>
                <p className="text-gray-600">Here’s what you been up to recently...</p>
            </div>
            <div className="flex p-4 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3/8">
                    {chapters.map((chapter, index) => (
                        <ChapterCard key={chapter.id} chapter={chapter} index={index} />
                    ))}
                </div>
                <div className="flex flex-col flex-1 gap-4">
                    <div>
                        <div className="font-semibold mb-2">Last 7 Days</div>
                        <div className="flex gap-2">
                            {activity.map(day => (
                                <div key={day.date} className={`rounded-full w-8 h-8 flex items-center justify-center ${day.attempted ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Last 10 Attempts</div>
                        <div className="flex gap-2">
                            {recentAttempts.map(a => (
                                <div key={a.id} className="flex flex-col items-center">
                                    <span className="text-xs text-gray-500">{new Date(a.completed_at).toLocaleDateString()}</span>
                                    <span className="font-bold">{a.score ?? "-"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between w-full gap-2">
                        <div className="rounded-lg bg-blue-100 p-4 flex-1 text-center">
                            <div className="text-xs text-gray-500">Average Score</div>
                            <div className="text-xl font-bold">{weeklyStats?.average_score ?? "-"}</div>
                        </div>
                        <div className="rounded-lg bg-green-100 p-4 flex-1 text-center">
                            <div className="text-xs text-gray-500">Highest Score</div>
                            <div className="text-xl font-bold">{weeklyStats?.highest_score ?? "-"}</div>
                        </div>
                        <div className="rounded-lg bg-yellow-100 p-4 flex-1 text-center">
                            <div className="text-xs text-gray-500">Attempts</div>
                            <div className="text-xl font-bold">{weeklyStats?.attempt_count ?? "-"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}