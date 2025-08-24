import {ChapterAttempt, ChapterAttemptInput} from "@/lib/types";
import api from "@/utils/axiosInstance";

export type GetChapterAttemptsParams = {
    limit?: number;
    start_date?: string;
    end_date?: string;
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

export async function getUserChapterAttempts(params?: GetChapterAttemptsParams): Promise<ChapterAttempt[]> {
    try {
        const res = await api.get(`/api/attempts/`, { params });
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