import {useState} from "react";

export type Chapter = {
    id: number;
    title: string;
    description: string;
}

export type Choice = {
    id: number;
    text: string;
    is_correct: boolean;
};

export type Question = {
    id: number;
    chapter: number;
    question_text: string;
    question_type: "MCQ" | "MRQ" | "TF";
    choices: Choice[];
    created_at: string;
};

export const dummyQuestions: Question[] = [
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

export const dummyChapters: Chapter[] = [
    {
        id: 1,
        title: 'Chapter 1',
        description: 'Chapter 1',
    },
    {
        id: 2,
        title: 'Chapter 2',
        description: 'Chapter 2',
    },
    {
        id: 3,
        title: 'Chapter 3',
        description: 'Chapter 3',
    },
    {
        id: 4,
        title: 'Chapter 4',
        description: 'Chapter 4',
    }
]