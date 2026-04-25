"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/utils/axiosInstance";
import { handleError } from "../../utils/handleError";
import { LayersIcon } from "lucide-react";
import Link from "next/link";

type LoginFormProps = {
    formLabel: string;
    isSignup: boolean;
    children?: React.ReactNode;
};

type Inputs = {
    username: string;
    email: string;
    password: string;
};

function LoginForm({ formLabel, isSignup, children }: LoginFormProps) {
    const router = useRouter();
    const { register, handleSubmit, formState: { isSubmitting } } = useForm<Inputs>();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const doSignup = async (data: Inputs) => {
        try {
            await api.post("/api/users/register/", {
                username: data.username,
                email: data.email,
                password: data.password,
            }, { withCredentials: true });
            router.push("/login");
        } catch (err) {
            setError(`Sign up failed: ${handleError(err)}`);
        }
    };

    const doLogin = async (data: Inputs) => {
        try {
            await api.post("/api/users/login/", {
                email: data.email,
                password: data.password,
            }, { withCredentials: true });
            router.push("/dashboard");
        } catch (err: any) {
            setError(err?.response?.data?.error || "Login failed");
        }
    };

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setError(null);
        if (isSignup) await doSignup(data);
        else await doLogin(data);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-lg p-9">

                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                        <LayersIcon size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">TestMeGemini</span>
                </div>
                <p className="text-center text-sm text-muted-foreground mb-7">
                    {isSignup ? "Create your account to get started." : "Turn your notes into questions. Log in to begin."}
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    {/* Username (signup only) */}
                    {isSignup && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted-foreground tracking-wide">
                                Username
                            </label>
                            <input
                                {...register("username", { required: isSignup })}
                                placeholder="e.g. nathan_cs"
                                type="text"
                                className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                            />
                        </div>
                    )}

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground tracking-wide">
                            Email
                        </label>
                        <input
                            {...register("email", { required: true })}
                            placeholder="you@university.edu"
                            type="email"
                            className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground tracking-wide">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                {...register("password", { required: true })}
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                className="w-full px-3 py-2.5 pr-14 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(p => !p)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
                            {error}
                        </p>
                    )}

                    {children}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 mt-1 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Please wait…" : formLabel}
                    </button>
                </form>

                {/* Footer link */}
                <p className="text-center text-sm text-muted-foreground mt-5">
                    {isSignup ? (
                        <>Already have an account?{" "}
                            <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link>
                        </>
                    ) : (
                        <>Don&apos;t have an account?{" "}
                            <Link href="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}

export default LoginForm;
