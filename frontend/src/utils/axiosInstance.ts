"use client";

import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    withCredentials: true,
});

const refreshApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/api/users/refresh/") {
            originalRequest._retry = true;

            try {
                const refreshResponse = await refreshApi.post("/api/users/refresh/");
                if (refreshResponse.status === 200) {
                    return api(originalRequest);
                }
            } catch {
                console.warn("Refresh failed, logging out");
            }

            await api.post("/api/users/logout/").catch(() => {});
            window.location.href = "/login";
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default api;