import AttemptsClient from "@/app/(protected)/attempts/AttemptsClient";
import getUserChapterAttempts from "@/utils/serverSide/getUserChapterAttempts";

export default async function Attempts() {
    const attempts = await getUserChapterAttempts();

    return <AttemptsClient attempts={attempts}/>
}