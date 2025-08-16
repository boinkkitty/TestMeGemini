"use client"

import {SubmitHandler, useForm} from "react-hook-form";
import {useRouter} from "next/navigation";
import axios from "axios";
import api from "@/utils/axiosInstance";

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

    const doSignup = async (data: Inputs) => {
        try {
            const res = await api.post(
                "/users/register/",
                {
                    username: data.username,
                    email: data.email,
                    password: data.password,
                },
                { withCredentials: true }
            );
            // Cookies are set by backend, so just redirect
            router.push("/login");
        } catch (err: any) {
            // Handle error (show message, etc.)
            alert(err?.response?.data?.error || "Signup failed");
        }
    };
    const doLogin = async (data: Inputs) => {
        try {
            const res = await api.post(
                "/users/login/",
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
                    <input
                        {...register("password")}
                        placeholder="Password"
                        type="text"
                        className="border border-gray-300 rounded-md shadow-md px-4 py-2"
                    />
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