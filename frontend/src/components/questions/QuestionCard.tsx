"use client";

import React, { useState } from "react";

type Choice = {
    text: string;
    is_correct?: boolean; // Optional, not needed for display
};

type Question = {
    id: number;
    chapter: number;
    question_text: string;
    question_type: "multiselect" | "single"; // Adjust if you have other types
    choices: Choice[];
    created_at: string;
};

type Props = {
    question: Question;
};

const QuestionCard: React.FC<Props> = ({ question }) => {
    const [selected, setSelected] = useState<number[]>([]);

    const handleChange = (idx: number) => {
        if (question.question_type === "multiselect") {
            setSelected((prev) =>
                prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
            );
        } else {
            setSelected([idx]);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-md p-6 max-w-xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{question.question_text}</h3>
            <form>
                {question.choices.map((choice, idx) => (
                    <div key={idx} className="mb-3">
                        <label
                            className="flex items-center cursor-pointer select-none text-gray-700 hover:text-blue-600"
                            htmlFor={`choice-${question.id}-${idx}`}
                        >
                            <input
                                id={`choice-${question.id}-${idx}`}
                                type={question.question_type === "multiselect" ? "checkbox" : "radio"}
                                name={`question-${question.id}`}
                                checked={selected.includes(idx)}
                                onChange={() => handleChange(idx)}
                                className="form-checkbox text-blue-600 focus:ring-blue-500 rounded"
                            />
                            <span className="ml-2">{choice.text}</span>
                        </label>
                    </div>
                ))}
            </form>
        </div>
    );
};

export default QuestionCard;
