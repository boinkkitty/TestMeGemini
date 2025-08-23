import { Chapter } from "@/lib/types";
import DropDownSelection from "@/components/ui/DropDownSelection";

type ChapterSelectionProps = {
    chapters: Chapter[];
    selectedChapterId: number | null | undefined;
    setSelectedChapterId: (chapterId: number | null) => void;
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
            <p className="text-md font-semibold">{`Come! Let's start practicing!`}</p>

            <DropDownSelection
                options={chapters.map((chapter) => ({
                    value: chapter.id.toString(),
                    label: chapter.title
                }))}
                value={selectedChapterId != null ? selectedChapterId.toString() : ""}
                onChange={(val) => {
                  if (val === "") {
                    setSelectedChapterId(null);
                  } else {
                    setSelectedChapterId(Number(val));
                  }
                }}
            />

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
