
import {ChapterAttempt} from "@/lib/types";
import api from "@/utils/axiosInstance";

/**
 *
 * @param attemptId
 */
async function getChapterAttempt(attemptId: number): Promise<ChapterAttempt> {
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

export default getChapterAttempt;
