import api from "@/utils/axiosInstance";
import {ChapterAttempt, ChapterAttemptInput} from "@/lib/types";

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
    } catch (error: any) {
        console.error("Failed to submit chapter attempt:", error);

        // Optional: log response data if using Axios
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }

        throw error; // re-throw so the caller can handle it
    }
}