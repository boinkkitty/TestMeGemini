import {Chapter} from "@/lib/types";
import api from "@/utils/axiosInstance";

export default async function getUserChapters(): Promise<Chapter[]> {
    try {
        const res = await api.get(`/api/chapters/`);
        return res.data;
    } catch (err) {
        console.error("Failed to fetch chapters:", err);
        return [];
    }
}