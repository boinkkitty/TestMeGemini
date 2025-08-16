
export async function getUserInfo() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/user-info`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Failed to fetch user info");
    return await res.json();
}

export default getUserInfo;