"use client"

import {SubmitHandler, useForm} from "react-hook-form";
import {useRouter} from "next/navigation";
import { useState } from "react";
import api from "@/utils/axiosInstance";
import {handleError} from "../../utils/handleError";

type LoginFormProps = {
    formLabel: string;
    isSignup: boolean;
    children?: React.ReactNode;
}

/**
 * Inputs for LoginForm form fields.
 * @typedef {Object} Inputs
 * @property {string} username - The user's username (signup only).
 * @property {string} email - The user's email address.
 * @property {string} password - The user's password.
 */
type Inputs = {
    username: string;
    email: string;
    password: string;
}

/**
 * LoginForm component for user authentication (login/signup).
 * Handles form state, submission, and error display for both login and signup flows.
 *
 * @component
 * @param {string} formLabel - The label for the submit button (e.g., 'Login' or 'Sign Up').
 * @param {boolean} isSignup - If true, renders signup fields and logic; otherwise, login.
 * @param {React.ReactNode} [children] - Optional children to render inside the form (e.g., extra buttons).
 */
function LoginForm({
    formLabel,
    isSignup,
    children,
   }: LoginFormProps) {
    // Next.js router for navigation after login/signup
    const router = useRouter();
    // React Hook Form for form state management
    const {register, handleSubmit} = useForm<Inputs>();

    // State to toggle password visibility
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Handles user signup by sending registration data to the backend.
     * On success, redirects to the login page. On error, shows an alert.
     * @param {Inputs} data - The form data (username, email, password)
     */
    const doSignup = async (data: Inputs) => {
        try {
            const res = await api.post(
                "/api/users/register/",
                {
                    username: data.username,
                    email: data.email,
                    password: data.password,
                },
                { withCredentials: true }
            );
            // Cookies are set by backend, so just redirect
            router.push("/login");
        } catch (err) {
            // Handle error (show message, etc.)
            const errorMsg = `Sign up failed \n ${handleError(err)}`;
            alert(errorMsg);
        }
    };
    /**
     * Handles user login by sending credentials to the backend.
     * On success, redirects to the dashboard. On error, shows an alert.
     * @param {Inputs} data - The form data (email, password)
     */
    const doLogin = async (data: Inputs) => {
        try {
            const res = await api.post(
                "/api/users/login/",
                {
                    email: data.email,
                    password: data.password,
                },
                { withCredentials: true }
            );
            // Cookies are set by backend, so just redirect
            router.push("/dashboard");
        } catch (err: any) {
            // Handle error (show message, etc.)
            alert(err?.response?.data?.error || "Login failed");
        }
    };

    /**
     * Handles form submission, dispatching to login or signup logic.
     * @param {Inputs} data - The form data
     */
    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        if (isSignup) {
            await doSignup(data);
        } else {
            await doLogin(data);
        }
    };

    return (
        <div className="flex flex-col gap-4 mx-auto p-8">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                {isSignup && (
                    <div className="flex flex-col gap-2">
                        <h1>Username</h1>
                        <input
                            {...register("username")}
                            placeholder="Username"
                            type="text"
                            className="border border-gray-300 rounded-md shadow-md px-4 py-2"
                        />
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    <h1>Email</h1>
                    <input
                        {...register("email")}
                        placeholder="Email"
                        type="text"
                        className="border border-gray-300 rounded-md shadow-md px-4 py-2"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h1>Password</h1>
                    <div className="relative flex items-center">
                        <input
                            {...register("password")}
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            className="border border-gray-300 rounded-md shadow-md px-4 py-2 w-full"
                        />
                        <button
                            type="button"
                            className="absolute right-3 text-xs text-blue-600 hover:underline focus:outline-none"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>
                {children}
                <button
                    className="py-3 rounded-md bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors enabled:hover:cursor-pointer disabled:cursor-not-allowed"
                    type="submit"
                >
                    {formLabel}
                </button>
            </form>
        </div>
    )
}

export default LoginForm