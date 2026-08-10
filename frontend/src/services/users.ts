/**
 * Service functions for user operations.
 * Includes fetching user info for the current session.
 *
 * @module services/users
 */

import api from "@/utils/axiosInstance";
import {UserInfo} from "@/lib/types";

/**
 * Fetch user info for the currently authenticated user.
 * @returns {Promise<UserInfo>} The user info object.
 * @throws {Error} If the fetch fails.
 */
export async function getUserInfo(): Promise<UserInfo> {
    try {
        const res = await api.get("/api/v1/users/me/", {
            withCredentials: true
        })

        return res.data;
    } catch (error) {
        console.error("Failed to fetch user info:", error);
        throw new Error("Failed to fetch user info");
    }
}
