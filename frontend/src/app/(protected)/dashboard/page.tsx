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
            {/*
                <div className="mb-6 px-6 flex flex-col justify-between">
                    <h1 className="text-2xl font-bold">
                        {`Welcome back ${userInfo?.username ?? ""}!`}
                    </h1>
                    <p className="text-gray-600">Here’s what you been up to recently...</p>
                </div>
            */}

            <div className="flex flex-col md:flex-row gap-8 p-4">
                {/* Recent Chapters Box */}
                <div className="flex flex-col border-2 border-blue-400 rounded-2xl bg-white shadow-md px-6 py-4 max-w-3/8 w-full md:w-1/2">
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

                {/* Latest Attempts Box */}
                <div className="flex flex-col border-2 border-orange-400 rounded-2xl bg-white shadow-md flex-1 gap-4 px-6 py-4 w-full md:w-1/2">
                    <div className="flex justify-start items-center p-2 w-full">
                        <h1 className="text-2xl font-extrabold text-orange-700 tracking-tight underline underline-offset-4 decoration-orange-300 drop-shadow-sm">
                            Latest Attempts
                        </h1>
                    </div>
                    <div className="flex flex-col px-6 py-4 mb-2 gap-6 w-full bg-white rounded-lg border shadow-sm">
                        <div className="flex justify-between items-center ">
                            <div className="font-semibold text-gray-700 w-full">7-Day Activity</div>
                            <RecentQuizStatus lastWeekAttempts={lastWeekAttempts} />
                        </div>
                        <div className="flex justify-between w-full gap-6">
                            <div className="border-2 border-orange-400 rounded-lg bg-orange-50 shadow-md transition-colors p-4 flex-1 text-left">
                                <div className="text-md font-bold text-orange-700 mb-2">Average Score</div>
                                <div className="font-extrabold text-5xl md:text-5xl text-orange-700 leading-tight">{averagePercentage?.toFixed(2) ?? "-"}%</div>
                            </div>
                            <div className="border-2 border-orange-400 rounded-lg bg-orange-50 shadow-md transition-colors p-4 flex-1 text-left">
                                <div className="text-md font-bold text-orange-700 mb-2">Highest Score</div>
                                <div className="font-extrabold text-5xl md:text-5xl text-orange-700 leading-tight">{highestPercentage.toFixed(2) ?? "-"}%</div>
                            </div>
                            <div className="border-2 border-orange-400 rounded-lg bg-orange-50 shadow-md transition-colors p-4 flex-1 text-left">
                                <div className="text-md font-bold text-orange-700 mb-2">Attempts</div>
                                <div className="font-extrabold text-5xl md:text-5xl text-orange-700 leading-tight">{lastWeekAttempts.length}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <BarChartComponent
                            data={lastTenAttempts.slice().reverse().map(a => ({
                                axisKey: a.title.length > 12 ? a.title.slice(0, 12) + '…' : a.title,
                                value: a.max_score && a.max_score > 0 ? (a.score / a.max_score) * 100 : 0,
                                title: a.title,
                                date: new Date(a.completed_at).toLocaleDateString(),
                                score: a.score,
                                max_score: a.max_score
                            }))}
                            label="Recent Attempts"
                            description="% Score for your last 10 attempts"
                            barColor="#f59e42"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
