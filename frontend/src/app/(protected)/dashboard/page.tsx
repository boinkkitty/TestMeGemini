"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Chapter, UserInfo, ChapterAttempt } from "@/lib/types";
import { getUserInfo } from "@/services/users";
import { getUserChapterAttempts } from "@/services/attempts";
import { formatDateYYYYMMDD, getNDaysAgo } from "@/utils/date";
import { getUserChapters } from "@/services/chapters";
import BarChartComponent from "@/components/dashboard/BarChartComponent";
import Link from "next/link";
import { BookOpenIcon, LayersIcon, ClockIcon, TrendingUpIcon } from "lucide-react";
import { getCategoryColor } from "@/utils/chapterStyles";

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

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return d;
    });
    const attemptDates = new Set(
        lastWeekAttempts.map(a => new Date(a.completed_at).toDateString())
    );

    useEffect(() => {
        setIsLoading(true);
        const startDate = formatDateYYYYMMDD(getNDaysAgo(6));
        Promise.all([
            getUserInfo().catch(() => null),
            getUserChapters({ limit: 4 }).catch(() => []),
            getUserChapterAttempts({ start_date: startDate }).catch(() => []),
            getUserChapterAttempts({ limit: 10 }),
        ]).then(([userInfoData, chaptersData, lastWeekData, lastTenData]) => {
            if (userInfoData) setUserInfo(userInfoData);
            setChapters(chaptersData);
            setLastWeekAttempts(lastWeekData);
            setLastTenAttempts(lastTenData);
        }).finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <LoadingSpinner message="Loading dashboard…" />;

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="p-8 space-y-6">

            {/* ── Header ── */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {greeting()}, {userInfo?.username ?? "there"} 👋
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Here&apos;s where you left off.</p>
                </div>
                <Link
                    href="/upload"
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                    + Upload Notes
                </Link>
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Total Chapters", value: chapters.length || "—", sub: "uploaded", icon: <LayersIcon size={16} /> },
                    { label: "Total Attempts", value: lastTenAttempts.length || "—", sub: "all time", icon: <ClockIcon size={16} /> },
                    { label: "Avg Score", value: `${averagePercentage}%`, sub: "7-day window", icon: <TrendingUpIcon size={16} />, accent: true },
                    { label: "Best Score", value: `${highestPercentage.toFixed(1)}%`, sub: "7-day window", icon: <TrendingUpIcon size={16} />, accent: true },
                ].map((stat, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                            {stat.icon}{stat.label}
                        </div>
                        <div className={`text-3xl font-extrabold tracking-tight ${stat.accent ? "text-primary" : "text-foreground"}`}>
                            {stat.value}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
                    </div>
                ))}
            </div>

            {/* ── Main row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">

                {/* Continue studying */}
                <div className="bg-card border border-border rounded-xl">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <div>
                            <p className="text-sm font-bold text-foreground">Continue Studying</p>
                            <p className="text-xs text-muted-foreground">Pick up where you left off</p>
                        </div>
                        <Link href="/chapters" className="text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 transition-colors">
                            All chapters →
                        </Link>
                    </div>
                    <div className="p-4 flex flex-col gap-2.5">
                        {chapters.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8">No chapters yet — upload your first PDF!</p>
                        )}
                        {chapters.map(ch => {
                            const color = getCategoryColor(ch.category);
                            return (
                                <Link
                                    key={ch.id}
                                    href="/chapters"
                                    className="flex items-center gap-3 p-3 border border-border rounded-xl hover:shadow-sm transition-all group"
                                >
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color.bg }}>
                                        <BookOpenIcon size={16} style={{ stroke: color.dot }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13.5px] font-semibold text-foreground truncate">{ch.title}</p>
                                        <span
                                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                                            style={{ background: color.bg, color: color.text }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color.dot }} />
                                            {ch.category}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <Link
                                            href="/quiz"
                                            onClick={e => e.stopPropagation()}
                                            className="text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md transition-colors"
                                        >
                                            Quiz →
                                        </Link>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Right column: activity + chart */}
                <div className="flex flex-col gap-4">
                    {/* Weekly activity */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <p className="text-sm font-bold text-foreground mb-4">Weekly Activity</p>
                        <div className="flex justify-between gap-1">
                            {last7Days.map((d, i) => {
                                const active = attemptDates.has(d.toDateString());
                                const dayLabel = d.toLocaleDateString("en", { weekday: "short" }).slice(0, 1);
                                return (
                                    <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border transition-colors ${active ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"}`}>
                                            {dayLabel}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-medium">
                                            {d.toLocaleDateString("en", { weekday: "short" }).slice(0, 3)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-xs text-muted-foreground">
                                {attemptDates.size} active day{attemptDates.size !== 1 ? "s" : ""} this week
                            </span>
                        </div>
                    </div>

                    {/* Score trend */}
                    <div className="bg-card border border-border rounded-xl p-5 flex-1">
                        <BarChartComponent
                            data={lastTenAttempts.slice().reverse().map(a => ({
                                axisKey: a.title.length > 10 ? a.title.slice(0, 10) + "…" : a.title,
                                value: a.max_score && a.max_score > 0 ? (a.score / a.max_score) * 100 : 0,
                                title: a.title,
                                category: a.category,
                                date: new Date(a.completed_at).toLocaleDateString(),
                                score: a.score,
                                max_score: a.max_score,
                            }))}
                            label="Score Trend"
                            description="Last 10 attempts"
                        />
                    </div>
                </div>
            </div>

            {/* ── Recent attempts ── */}
            {lastTenAttempts.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recent Attempts</p>
                        <Link href="/attempts" className="text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 transition-colors">
                            View all →
                        </Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        {lastTenAttempts.slice(0, 3).map(a => {
                            const pct = a.max_score ? Math.round((a.score / a.max_score) * 100) : 0;
                            const color = getCategoryColor(a.category);
                            const badgeColor = pct >= 70 ? "bg-green-100 text-green-700" : pct >= 40 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700";
                            return (
                                <Link
                                    key={a.id}
                                    href="/attempts"
                                    className="flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-3 hover:shadow-sm transition-all"
                                >
                                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-extrabold text-sm" style={{ background: color.bg, color: color.dot }}>
                                        {pct}%
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">{a.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{a.category} · {a.score}/{a.max_score} correct</p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeColor}`}>
                                        {pct >= 70 ? "Great" : pct >= 40 ? "Decent" : "Retry"} →
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
