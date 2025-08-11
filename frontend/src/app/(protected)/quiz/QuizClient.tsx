'use client';

import {Question} from "@/lib/types";
import PaginatedQuestions from "@/components/questions/PaginatedQuestions";
import QuizComponent from "@/components/questions/QuizComponent";

export default function QuizClient() {
    const dummyQuestions: Question[] = [
        {
            id: 1,
            chapter: 101,
            question_text: "What is the capital of France?",
            question_type: "MCQ",
            created_at: "2025-08-11T10:00:00Z",
            choices: [
                { id: 1, text: "Paris", is_correct: true },
                { id: 2, text: "London", is_correct: false },
                { id: 3, text: "Berlin", is_correct: false },
                { id: 4, text: "Madrid", is_correct: false },
            ],
        },
        {
            id: 2,
            chapter: 101,
            question_text: "Select all prime numbers.",
            question_type: "MRQ",
            created_at: "2025-08-11T10:10:00Z",
            choices: [
                { id: 5, text: "2", is_correct: true },
                { id: 6, text: "3", is_correct: true },
                { id: 7, text: "4", is_correct: false },
                { id: 8, text: "5", is_correct: true },
            ],
        },
        {
            id: 3,
            chapter: 101,
            question_text: "The Earth is flat.",
            question_type: "TF",
            created_at: "2025-08-11T10:15:00Z",
            choices: [
                { id: 9, text: "True", is_correct: false },
                { id: 10, text: "False", is_correct: true },
            ],
        },
    ];

    return (
        <div className="flex justify-center items-center w-full h-full">
            <PaginatedQuestions questions={dummyQuestions} onSubmit={() => {}}/>
            <QuizComponent questions={dummyQuestions}/>
        </div>
    );
}