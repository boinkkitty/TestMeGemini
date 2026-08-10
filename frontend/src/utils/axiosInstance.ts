"use client";

import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken",
});

// Second instance to avoid interceptor loop
const refreshApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken",
});

const REFRESH_URL = "/api/v1/auth/token/refresh/";
const LOGOUT_URL = "/api/v1/auth/logout/";

export async function ensureCsrfCookie(): Promise<void> {
    await refreshApi.get("/api/v1/auth/csrf/");
}

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // If unauthorized, try to refresh
        if (
            error.response?.status === 401
            && !originalRequest._retry
            && ![REFRESH_URL, LOGOUT_URL].includes(originalRequest.url)
        ) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await refreshApi.post(REFRESH_URL);
                if (refreshResponse.status === 200) {
                // Retry the original request
                return api(originalRequest);
                }
            } catch {
                console.warn("Refresh failed, logging out");
            }

            // If refresh fails (or original request fails), force logout
            await api.post(LOGOUT_URL).catch(() => {}); // best-effort cookie cleanup
            window.location.assign("/login");
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default api;
