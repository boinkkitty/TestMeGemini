/**
 * Service functions for chapter CRUD operations.
 * Includes fetching, creating, soft deleting, and permanently deleting chapters.
 *
 * @module services/chapters
 */

import {Chapter} from "@/lib/types";
import api from "@/utils/axiosInstance";

/**
 * Parameters for filtering user chapters.
 * @typedef {Object} GetChaptersParams
 * @property {number} [limit] - Maximum number of chapters to fetch.
 */
export type GetChaptersParams = {
    limit?: number;
}

/**
 * Fetch all chapters for the current user, optionally filtered by params.
 * @param {GetChaptersParams} [params] - Optional filter parameters.
 * @returns {Promise<Chapter[]>} List of chapters.
 */
export async function getUserChapters(params?: GetChaptersParams): Promise<Chapter[]> {
    try {
        const res = await api.get(`/api/chapters/`, { params });
        return res.data;
    } catch (err) {
        console.error("Failed to fetch chapters:", err);
        return [];
    }
}

/**
 * Parameters for creating chapters and questions.
 * @typedef {Object} CreateChaptersAndQuestionsParams
 * @property {string} title - The chapter title.
 * @property {string} category - The category for the chapter.
 * @property {File[]} files - Files to upload for the chapter.
 */
export type CreateChaptersAndQuestionsParams = {
    title: string;
    category: string;
    files: File[];
};

/**
 * Create a new chapter and its questions by uploading files.
 * @param {CreateChaptersAndQuestionsParams} params - The chapter and files to upload.
 * @returns {Promise<Chapter>} The created chapter.
 * @throws {Error} If creation fails.
 */
export async function createChaptersAndQuestions({ title, category, files }: CreateChaptersAndQuestionsParams): Promise<Chapter> {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }
    try {
        const res = await api.post("/api/chapters/", formData);
        return res.data;
    } catch (err) {
        console.error("Failed to create chapter and questions:", err);
        throw err;
    }
}

/**
 * Soft delete a chapter (mark as deleted but not remove from DB).
 * @param {number} chapterId - The ID of the chapter to soft delete.
 * @returns {Promise<void>}
 */
export async function softDeleteChapter(chapterId: number): Promise<void> {
    try {
        await api.put(`/api/chapters/${chapterId}/`, {
            is_deleted: true,
        });
    } catch (err) {
        console.error("Failed to soft delete chapter:", err);
    }
}

/**
 * Permanently delete a chapter from the database.
 * @param {number} chapterId - The ID of the chapter to delete.
 * @returns {Promise<void>}
 */
export async function deleteChapter(chapterId: number): Promise<void> {
    try {
        await api.delete(`/api/chapters/${chapterId}/`);
    } catch (err) {
        console.error("Failed to permanently delete chapter:", err);
    }
}