import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {

    return (
        <div className="flex flex-col h-screen w-screen justify-center items-center border gap-2">
            <div className="flex flex-col justify-center items-center gap-2">
                <div className="flex item-center justify-center gap-2">
                    <Image src="/public/file.svg" width={30} height={30} alt="" />
                    <h1 className="flex text-4xl font-bold items-center justify-center">
                        TestMeGPT
                    </h1>
                </div>
                <h1>
                    Turn your notes into questions. Log in to begin!
                </h1>
            </div>
            <div className="w-[500px]">
                <LoginForm formLabel={"Login"} isSignup={false}/>
            </div>
            <div>
                <p className="text-sm text-gray-600 text-center mt-4">
                    Don’t have an account?{' '}
                    <Link href="/signup" className="text-blue-600 hover:underline hover:cursor-pointer">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}