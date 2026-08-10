import React from "react";
import { Choice } from "@/lib/types";

type AttemptChoicesProps = {
  choices: Choice[];
  selected: number[];
};

function AttemptChoices({ choices, selected }: AttemptChoicesProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {choices.map((choice) => {
        const isSelected = selected.includes(choice.id);
        const isCorrect = choice.is_correct;

        let stateClass = "border-border";
        let labelClass = "text-foreground";
        let sideTag: React.ReactNode = null;

        if (isCorrect && isSelected) {
          stateClass = "border-green-500 bg-green-50";
          labelClass = "text-green-800 font-semibold";
          sideTag = <span className="ml-auto text-[11px] font-bold text-green-700 whitespace-nowrap">✓ Correct</span>;
        } else if (isCorrect && !isSelected) {
          stateClass = "border-green-400 bg-green-50/60";
          labelClass = "text-green-700";
          sideTag = <span className="ml-auto text-[11px] font-bold text-green-600 whitespace-nowrap">Correct answer</span>;
        } else if (!isCorrect && isSelected) {
          stateClass = "border-red-400 bg-red-50";
          labelClass = "text-red-800";
          sideTag = <span className="ml-auto text-[11px] font-bold text-red-600 whitespace-nowrap">✗ Your pick</span>;
        }

        return (
          <div
            key={choice.id}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-[1.5px] ${stateClass}`}
          >
            <span className={`text-sm flex-1 ${labelClass}`}>{choice.text}</span>
            {sideTag}
          </div>
        );
      })}
    </div>
  );
}

export default AttemptChoices;
