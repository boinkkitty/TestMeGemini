import {ChapterAttempt} from "@/lib/types";
import api from "@/utils/axiosInstance";

export default async function getUserChapterAttempts(): Promise<ChapterAttempt[]> {
    try {
        const res = await api.get(`/api/attempts/`);
        return res.data;
    } catch (err) {
        console.error("Failed to fetch attempts:", err);
        return [];
    }
}