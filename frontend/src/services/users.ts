import api from "@/utils/axiosInstance";
import {UserInfo} from "@/lib/types";

export async function getUserInfo(): Promise<UserInfo> {
    try {
        const res = await api.get("/api/users/user-info", {
            withCredentials: true
        })

        return res.data;
    } catch (error) {
        console.error("Failed to fetch user info:", error);
        throw new Error("Failed to fetch user info");
    }

}