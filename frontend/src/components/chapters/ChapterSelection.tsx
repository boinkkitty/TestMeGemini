import { Chapter } from "@/lib/types";

type ChapterSelectionProps = {
    chapters: Chapter[];
    selectedChapterId: number | null | undefined;
    setSelectedChapterId: (chapterId: number) => void;
    handleStart: () => void;
};

function ChapterSelection({
    chapters,
    selectedChapterId,
    setSelectedChapterId,
    handleStart,
}: ChapterSelectionProps) {
    return (
        <div className="flex flex-col justify-center items-center w-full h-full gap-4">
            <p className="text-md font-semibold">Come! Let's start practicing!</p>

            <select
                value={selectedChapterId ?? ""}
                onChange={(e) => setSelectedChapterId(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select a chapter</option>
                {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                        {chapter.title}
                    </option>
                ))}
            </select>

            <button
                onClick={handleStart}
                disabled={!selectedChapterId}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200
                    ${selectedChapterId ? "bg-blue-600 hover:bg-blue-700 enabled:hover:cursor-pointer" : "bg-gray-400 cursor-not-allowed"}
                `}
            >
                Start
            </button>
        </div>
    );
}

export default ChapterSelection;
