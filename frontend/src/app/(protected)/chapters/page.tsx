import ChaptersClient from "@/app/(protected)/chapters/ChaptersClient";
import getUserChapters from "@/utils/serverSide/getUserChapters";

export default async function Chapters() {
    const chapters = await getUserChapters();

    return <ChaptersClient chapters={chapters} />
}