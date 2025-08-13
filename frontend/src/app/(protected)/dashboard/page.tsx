import DashboardClient from "@/app/(protected)/dashboard/DashboardClient";
import getUserChapters from "@/utils/getServer/getUserChapters";

export default async function Dashboard() {
    // const chapters = await getUserChapters();
    return <DashboardClient/>
}