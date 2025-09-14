"use client";

import axios from "axios";
import Router from "next/router";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    withCredentials: true,
});

// Second instance to avoid interceptor loop
const refreshApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // If unauthorized, try to refresh
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/api/users/refresh/") {
            originalRequest._retry = true;

            try {
                const refreshResponse = await refreshApi.post("/api/users/refresh/");
                if (refreshResponse.status === 200) {
                // Retry the original request
                return api(originalRequest);
                }
            } catch (refreshError) {
                console.warn("Refresh failed, logging out");
            }

            // If refresh fails (or original request fails), force logout
            await api.post("/api/users/logout/").catch(() => {}); // ignore errors
            Router.push("/login");
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default api;