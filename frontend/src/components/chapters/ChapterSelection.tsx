import { Chapter } from "@/lib/types";
import DropDownSelection from "@/components/ui/DropDownSelection";

type ChapterSelectionProps = {
    chapters: Chapter[];
    selectedChapterId: number | null | undefined;
    setSelectedChapterId: (chapterId: number | null) => void;
    handleStart: () => void;
};

/**
 * ChapterSelection component allows users to select a chapter from a dropdown and start a quiz.
 *
 * @component
 * @param {Chapter[]} chapters - Array of chapters to select from.
 * @param {number | null | undefined} selectedChapterId - The currently selected chapter ID.
 * @param {(chapterId: number | null) => void} setSelectedChapterId - Handler to set the selected chapter ID.
 * @param {() => void} handleStart - Handler to start the quiz.
 */
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
                    label: `${chapter.category}: ${chapter.title}`,
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

/**
 * Props for ChapterSelection component.
 * @typedef {Object} ChapterSelectionProps
 * @property {Chapter[]} chapters - Array of chapters to select from.
 * @property {number | null | undefined} selectedChapterId - The currently selected chapter ID.
 * @property {(chapterId: number | null) => void} setSelectedChapterId - Handler to set the selected chapter ID.
 * @property {() => void} handleStart - Handler to start the quiz.
 */

export default ChapterSelection;
