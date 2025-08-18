"use client"

import {SubmitHandler, useForm} from "react-hook-form";
import {useRouter} from "next/navigation";
import { useState } from "react";
import axios from "axios";
import api from "@/utils/axiosInstance";
import {handleError} from "@/utils/clientSide/handleError";

type LoginFormProps = {
    formLabel: string;
    isSignup: boolean;
    children?: React.ReactNode;
}

type Inputs = {
    username: string;
    email: string;
    password: string;
}

function LoginForm({
    formLabel,
    isSignup,
    children,
   }: LoginFormProps) {
    const router = useRouter();
    const {register, handleSubmit} = useForm<Inputs>();

    const [showPassword, setShowPassword] = useState(false);

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