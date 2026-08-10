/**
 * Service functions for chapter attempt operations.
 * Includes fetching, listing, and submitting chapter attempts.
 *
 * @module services/attempts
 */

import {ChapterAttempt, ChapterAttemptInput} from "@/lib/types";
import api from "@/utils/axiosInstance";

/**
 * Parameters for filtering user chapter attempts.
 * @typedef {Object} GetChapterAttemptsParams
 * @property {number} [limit] - Maximum number of attempts to fetch.
 * @property {string} [start_date] - Filter attempts after this date (YYYY-MM-DD).
 * @property {string} [end_date] - Filter attempts before this date (YYYY-MM-DD).
 */
export type GetChapterAttemptsParams = {
    limit?: number;
    start_date?: string;
    end_date?: string;
}

/**
 * Fetch a single chapter attempt by its ID.
 * @param {number} attemptId - The ID of the attempt to fetch.
 * @returns {Promise<ChapterAttempt>} The chapter attempt data.
 * @throws {Error} If the fetch fails.
 */
export async function getChapterAttempt(attemptId: number): Promise<ChapterAttempt> {
    try {
        const res = await api.get(`/api/v1/attempts/${attemptId}/`, {
            withCredentials: true,
        });
        return res.data;
    } catch (error) {
        console.error("Failed to fetch chapter attempt:", error);
        throw new Error("Failed to fetch chapter attempt");
    }
}

/**
 * Fetch all chapter attempts for the current user, optionally filtered by params.
 * @param {GetChapterAttemptsParams} [params] - Optional filter parameters.
 * @returns {Promise<ChapterAttempt[]>} List of chapter attempts.
 */
export async function getUserChapterAttempts(params?: GetChapterAttemptsParams): Promise<ChapterAttempt[]> {
    try {
        const res = await api.get(`/api/v1/attempts/`, { params });
        return res.data;
    } catch (err) {
        console.error("Failed to fetch attempts:", err);
        return [];
    }
}

/**
 * Submit a new chapter attempt to the backend.
 * @param {ChapterAttemptInput} attempt - The attempt data to submit.
 * @returns {Promise<ChapterAttempt>} The created chapter attempt.
 * @throws {Error} If submission fails.
 */
export async function submitChapterAttempt(attempt: ChapterAttemptInput): Promise<ChapterAttempt> {
    try {
        const res = await api.post("/api/v1/attempts/", attempt);
        return res.data;
    } catch (error) {
        console.error("Failed to submit chapter attempt:", error);
        throw error; // re-throw so the caller can handle it
    }
}
