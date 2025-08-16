"use client";

import axios from "axios";
import Router from "next/router";
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // If unauthorized, try to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await api.post("/users/refresh/");
                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                Router.push("/login");
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;