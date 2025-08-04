"use client"

import {SubmitHandler, useForm} from "react-hook-form";
import {useRouter} from "next/navigation";

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
        router.push("/login");
    };
    const doLogin = async (data: Inputs) => {
        router.push("/home");
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
                    className="py-3 rounded-md bg-blue-600 text-white shadow-md"
                    type="submit"
                >
                    {formLabel}
                </button>
            </form>
        </div>
    )
}

export default LoginForm