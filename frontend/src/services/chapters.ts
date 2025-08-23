import {Chapter} from "@/lib/types";
import api from "@/utils/axiosInstance";

export type ChaptersParams = {
    limit?: number;
}

export async function getUserChapters(params?: ChaptersParams): Promise<Chapter[]> {
    try {
        const res = await api.get(`/api/chapters/`, { params });
        return res.data;
    } catch (err) {
        console.error("Failed to fetch chapters:", err);
        return [];
    }
}