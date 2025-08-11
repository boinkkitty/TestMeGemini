import {Chapter} from "@/lib/types";

export async function getUserChapters(): Promise<Chapter[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chapters/my-chapters/`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Failed to fetch chapters");

    const data: Chapter[] = await res.json();
    return data;
}

export default getUserChapters;
