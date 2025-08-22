import {ChapterAttempt, ChapterAttemptInput} from "@/lib/types";
import api from "@/utils/axiosInstance";

export type ActivityDay = { date: string; attempted: boolean };
export type WeeklyStats = { average_score: number; highest_score: number; attempt_count: number };

export async function getUserActivity(days: number): Promise<ActivityDay[]> {
    const res = await api.get(`/api/attempts/activity/`, {
        params: {
            days,
        }
    });
    return res.data;
}

export async function getWeeklyStats(): Promise<WeeklyStats> {
    const res = await api.get("/api/attempts/weekly-stats/");
    return res.data;
}

export async function getRecentChapterAttempts(limit: number): Promise<ChapterAttempt[]> {
    const res = await api.get(`/api/attempts/`, {
        params: {
            limit,
        }
    });
    return res.data;
}

export async function getChapterAttempt(attemptId: number): Promise<ChapterAttempt> {
    try {
        const res = await api.get(`/api/attempts/${attemptId}/`, {
            withCredentials: true,
        });
        return res.data;
    } catch (error) {
        console.error("Failed to fetch chapters:", error);
        throw new Error("Failed to fetch chapters");
    }
}

export async function getUserChapterAttempts(): Promise<ChapterAttempt[]> {
    try {
        const res = await api.get(`/api/attempts/`);
        return res.data;
    } catch (err) {
        console.error("Failed to fetch attempts:", err);
        return [];
    }
}

/**
 * Submits a chapter attempt to the backend.
 * @param attempt - The attempt data to submit
 * @returns The created ChapterAttempt from the backend
 */
export async function submitChapterAttempt(attempt: ChapterAttemptInput): Promise<ChapterAttempt> {
    try {
        const res = await api.post("/api/attempts/", attempt);
        console.log("Chapter attempt submitted successfully:", res.data); // optional success log
        return res.data;
    } catch (error) {
        console.error("Failed to submit chapter attempt:", error);
        throw error; // re-throw so the caller can handle it
    }
}