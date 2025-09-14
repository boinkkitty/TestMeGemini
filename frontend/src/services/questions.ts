/**
 * Service functions for question operations.
 * Includes fetching questions for a chapter.
 *
 * @module services/questions
 */

import { Question } from "@/lib/types";
import api from "@/utils/axiosInstance";

/**
 * Fetch all questions for a specific chapter.
 * @param {number} chapterId - The ID of the chapter to fetch questions for.
 * @returns {Promise<Question[]>} List of questions for the chapter.
 * @throws {Error} If the fetch fails.
 */
export async function getChapterQuestions(chapterId: number): Promise<Question[]> {
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
