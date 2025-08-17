
import { Question } from "@/lib/types";
import api from "@/utils/axiosInstance";

/**
 * Client-side utility to fetch chapter questions.
 * Fetches questions for a specific chapter from the server.
 * @param chapterId - The ID of the chapter to fetch questions for.
 * @returns A promise that resolves to an array of questions.
 */
async function getChapterQuestions(chapterId: number): Promise<Question[]> {
    try {
        const res = await api.get(`/api/chapters/${chapterId}/questions/`, {
            withCredentials: true, 
        });
        return res.data;
    } catch (error) {
        console.error("Failed to fetch chapters:", error);
        throw new Error("Failed to fetch chapters");
    }
}

export default getChapterQuestions;
