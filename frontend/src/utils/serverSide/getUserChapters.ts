// import { cookies } from "next/headers";
// import { Chapter } from "@/lib/types";
//
// async function getUserChapters(): Promise<Chapter[]> {
//     const cookieStore = await cookies();
//     const accessToken = cookieStore.get("access_token")?.value;
//     console.log(accessToken);
//     const cookieHeader = accessToken ? `access_token=${accessToken}` : "";
//
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chapters/`, {
//         headers: {
//             Cookie: cookieHeader,
//         },
//         // credentials: "include" // not needed in SSR
//     });
//
//     if (!res.ok) throw new Error("Failed to fetch chapters");
//     return res.json();
// }
//
// export default getUserChapters;
