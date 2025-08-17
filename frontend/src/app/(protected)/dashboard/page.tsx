import DashboardClient from "@/app/(protected)/dashboard/DashboardClient";
import getUserChapters from "@/utils/serverSide/getUserChapters";

export default async function Dashboard() {
    const chapters = await getUserChapters();
    return <DashboardClient chapters={chapters} />
}