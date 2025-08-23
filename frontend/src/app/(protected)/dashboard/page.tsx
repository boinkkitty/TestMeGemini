"use client";
import { useEffect, useState } from "react";
import ChapterCard from "@/components/chapters/ChapterCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Chapter, UserInfo, ChapterAttempt } from "@/lib/types";
import { getUserInfo } from "@/services/users";
import { getUserChapterAttempts } from "@/services/attempts";
import { formatDateYYYYMMDD, getNDaysAgo } from "@/utils/date";
import { getUserChapters } from "@/services/chapters";
import RecentQuizStatus from "@/components/dashboard/RecentQuizStatus";
import BarChartComponent from "@/components/dashboard/BarChartComponent";

export default function Dashboard() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [lastWeekAttempts, setLastWeekAttempts] = useState<ChapterAttempt[]>([]);
    const [lastTenAttempts, setLastTenAttempts] = useState<ChapterAttempt[]>([]);

    const percentages = lastWeekAttempts
        .filter(a => a.max_score && a.max_score > 0)
        .map(a => (a.score / a.max_score) * 100);

    const highestPercentage = percentages.length > 0 ? Math.max(...percentages) : 0;
    const averagePercentage =
        percentages.length > 0
            ? Math.round((percentages.reduce((sum, p) => sum + p, 0) / percentages.length) * 10) / 10
            : 0;

    useEffect(() => {
        setIsLoading(true);
        const startDate: string = formatDateYYYYMMDD(getNDaysAgo(6));

        Promise.all([
            getUserInfo().catch(() => null),
            getUserChapters({ limit: 6 }).catch(() => []),
            getUserChapterAttempts({ start_date: startDate }).catch(() => []),
            getUserChapterAttempts({ limit: 10 })
        ]).then(([userInfoData, chaptersData, lastWeekAttemptsData, lastTenAttemptsData]) => {
            if (userInfoData) setUserInfo(userInfoData);
            setChapters(chaptersData);
            setLastWeekAttempts(lastWeekAttemptsData);
            setLastTenAttempts(lastTenAttemptsData);
        }).finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;

    return (
        <div className="p-6">
            <div className="mb-8 px-6 flex flex-col justify-between">
                <h1 className="text-2xl font-bold">
                    {`Welcome back ${userInfo?.username ?? ""}!`}
                </h1>
                <p className="text-gray-600">Here’s what you been up to recently...</p>
            </div>
            <div className="flex p-4 gap-8">
                <div className="flex flex-col border border-blue-400 rounded-xl px-6 py-4 max-w-3/8">
                    <div className="flex justify-start items-center p-2 mb-4 w-full">
                        <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight underline underline-offset-4 decoration-blue-300 drop-shadow-sm">
                            Recent Chapters
                        </h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                        {chapters.map((chapter, index) => (
                            <ChapterCard key={chapter.id} chapter={chapter} index={index} />
                        ))}
                    </div>
                </div>


                <div className="border border-blue-400 rounded-xl flex flex-col flex-1 gap-4 px-6 py-4">
                    <div className="flex justify-start items-center p-2 mb-2 w-full">
                        <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight underline underline-offset-4 decoration-blue-300 drop-shadow-sm">
                            Latest Attempts
                        </h1>
                    </div>
                    <div className="flex flex-col p-2 mb-2 gap-8 w-full">
                        <div className="font-semibold text-gray-700">7-Day Activity</div>
                        <RecentQuizStatus lastWeekAttempts={lastWeekAttempts} />
                        <div className="flex justify-between w-full gap-6">
                            <div className="border-2 border-blue-400 rounded-lg bg-white shadow-md transition-colors p-6 flex-1 text-left">
                                <div className="text-md font-bold text-gray-700 mb-2">Average Score</div>
                                <div className="font-extrabold text-5xl md:text-5xl text-blue-700 leading-tight">{averagePercentage?.toFixed(2) ?? "-"}%</div>
                            </div>
                            <div className="border-2 border-blue-400 rounded-lg bg-white shadow-md transition-colors p-6 flex-1 text-left">
                                <div className="text-md font-bold text-gray-700 mb-2">Highest Score</div>
                                <div className="font-extrabold text-5xl md:text-5xl text-blue-700 leading-tight">{highestPercentage.toFixed(2) ?? "-"}%</div>
                            </div>
                            <div className="border-2 border-blue-400 rounded-lg bg-white shadow-md transition-colors p-6 flex-1 text-left">
                                <div className="text-md font-bold text-gray-700 mb-2">Attempts</div>
                                <div className="font-extrabold text-5xl md:text-5xl text-blue-700 leading-tight">{lastWeekAttempts.length}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Last 10 Attempts</div>
                        <div className="flex gap-2">
                            {lastTenAttempts.map(a => (
                                <div key={a.id} className="flex flex-col items-center">
                                    <span className="text-xs text-gray-500">{new Date(a.completed_at).toLocaleDateString()}</span>
                                    <span className="font-bold">{a.score.toFixed(2) ?? "-"}</span>
                                </div>
                            ))}
                        </div>
                        <BarChartComponent/>
                    </div>

                </div>
            </div>
        </div>
    );
}
