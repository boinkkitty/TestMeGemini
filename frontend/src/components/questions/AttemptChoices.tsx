import React from "react";
import { Choice } from "@/lib/types";

interface AttemptChoicesProps {
  choices: Choice[];
  selected: number[];
}

const AttemptChoices: React.FC<AttemptChoicesProps> = ({ choices, selected }) => {
  return (
    <div className="flex flex-col gap-2 mt-2 justify-center">
      {choices.map((choice, idx) => {
        const isSelected = selected.includes(choice.id);
        const isCorrect = choice.is_correct;
        let indicator = null;
        let color = "";
        if (isSelected && isCorrect) {
          indicator = <span className="ml-2 text-green-600">✔</span>;
          color = "text-green-700 font-semibold";
        } else if (isSelected && !isCorrect) {
          indicator = <span className="ml-2 text-red-600">✘</span>;
          color = "text-red-700 font-semibold";
        } else if (!isSelected && isCorrect) {
          indicator = <span className="ml-2 text-green-400">✔</span>;
          color = "text-green-400";
        } else {
          color = "text-gray-700";
        }
        return (
          <div key={choice.id} className={`flex items-center border-b last:border-b-0 pb-2 mb-2 ${color}`}>
            <span>{choice.text}</span>
            {indicator}
          </div>
        );
      })}
    </div>
  );
};

export default AttemptChoices;
