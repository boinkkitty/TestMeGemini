import {formatDateYYYYMMDD, getNDaysAgo} from "@/utils/date";
import {ChapterAttempt} from "@/lib/types";

type RecentQuizStatusProps = {
    lastWeekAttempts: ChapterAttempt[]
}

function RecentQuizStatus({lastWeekAttempts}: RecentQuizStatusProps) {
    // Activity: last 7 days (including today)
    const last7Days: Date[] = Array.from({ length: 7 }, (_, i) => getNDaysAgo(6 - i));
    const last7DaysStr: string[] = last7Days.map(formatDateYYYYMMDD);
    const activity = last7Days.map((dateObj, idx) => {
        const dateStr = last7DaysStr[idx];
        // Check if any attempt in lastWeekAttempts was completed on this date
        const attempted = lastWeekAttempts.some(a => formatDateYYYYMMDD(new Date(a.completed_at)) === dateStr);
        return { date: dateStr, attempted };
    });

    return (<div className="flex gap-2 w-full justify-center gap-6">
        {activity.map(day => (
            <div key={day.date} className={`rounded-full w-12 h-10 flex items-center justify-center ${day.attempted ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {new Date(day.date).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}
            </div>
        ))}
    </div>)
}

export default RecentQuizStatus;