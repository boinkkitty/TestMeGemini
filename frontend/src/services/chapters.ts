import {Chapter} from "@/lib/types";
import api from "@/utils/axiosInstance";

export type GetChaptersParams = {
    limit?: number;
}

export async function getUserChapters(params?: GetChaptersParams): Promise<Chapter[]> {
    try {
        const res = await api.get(`/api/chapters/`, { params });
        return res.data;
    } catch (err) {
        console.error("Failed to fetch chapters:", err);
        return [];
    }
}

export type CreateChaptersAndQuestionsParams = {
    title: string;
    category: string;
    files: File[];
};

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

export async function softDeleteChapter(chapterId: number): Promise<void> {
    try {
        await api.put(`/api/chapters/${chapterId}/`, {
            is_deleted: true,
        });
    } catch (err) {
        console.error("Failed to soft delete chapter:", err);
    }
}

export async function deleteChapter(chapterId: number): Promise<void> {
    try {
        await api.delete(`/api/chapters/${chapterId}/`);
    } catch (err) {
        console.error("Failed to permanently delete chapter:", err);
    }
}