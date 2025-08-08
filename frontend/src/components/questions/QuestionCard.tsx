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
        <div className="question-card">
            <h3>{question.question_text}</h3>
            <form>
                {question.choices.map((choice, idx) => (
                    <div key={idx}>
                        <label>
                            <input
                                type={question.question_type === "multiselect" ? "checkbox" : "radio"}
                                name={`question-${question.id}`}
                                checked={selected.includes(idx)}
                                onChange={() => handleChange(idx)}
                            />
                            {choice.text}
                        </label>
                    </div>
                ))}
            </form>
        </div>
    );
};

export default QuestionCard;