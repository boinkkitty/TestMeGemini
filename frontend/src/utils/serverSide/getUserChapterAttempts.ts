import { cookies } from "next/headers";
import { ChapterAttempt } from "@/lib/types";

async function getUserChapterAttempts(): Promise<ChapterAttempt[]> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const cookieHeader = accessToken ? `access_token=${accessToken}` : "";

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attempts/`, {
        headers: {
            Cookie: cookieHeader,
        },
        // credentials: "include" // not needed in SSR
    });

    if (!res.ok) throw new Error("Failed to fetch chapter attempts");
    return res.json();
}

export default getUserChapterAttempts;
