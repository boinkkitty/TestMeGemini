import QuizClient from "@/app/(protected)/quiz/QuizClient";
import getUserChapters from "@/utils/getServer/getUserChapters";

export default async function Quiz() {
    // Select chapter to test
    // const chapters = await getUserChapters();

    return (<QuizClient/>
    )
}