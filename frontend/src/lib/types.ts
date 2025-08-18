export type Chapter = {
    id: number;
    title: string;
    description: string;
    category: string;
    questions?: Question[];
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

export type ChapterAttempt = {
    id: number;
    title: string;
    score: number;
    completed_at: string;
    chapter_id: number;
    order: Array<number>;
    question_attempts?: QuestionAttempt[];
}

export type QuestionAttempt = {
    id: number;
    score: number;
    chapter_attempt: number;
    selected_choices: number[];
    question_detail: Question;
}

export type ChapterAttemptInput = {
    chapter_id: number;
    order: number[];
    questions: QuestionAttemptInput[];
}

export type QuestionAttemptInput = {
    question_id: number;
    selected_choices: number[];
}

export const dummyQuestions: Question[] = [
    {
        id: 1,
        chapter: 1,
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
        chapter: 1,
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
        chapter: 1,
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
        category: "Beginner",
        questions: dummyQuestions,
    },
    {
        id: 2,
        title: 'Chapter 2',
        description: 'Chapter 2',
        category: "Advanced",
        questions: [],
    },
    {
        id: 3,
        title: 'Chapter 3',
        description: 'Chapter 3',
        category: "Intermediate",
        questions: [],
    },
    {
        id: 4,
        title: 'Chapter 4',
        description: 'Chapter 4',
        category: "Advanced",
        questions: [],
    },
];

export const dummyQuestionAttempts: QuestionAttempt[] = [
    {
        id: 1,
        score: 1,
        chapter_attempt: 1,
        selected_choices: [1],
        question_detail: dummyQuestions[0],
    },
    {
        id: 2,
        score: 2,
        chapter_attempt: 1,
        selected_choices: [5, 6, 8],
        question_detail: dummyQuestions[1],
    },
    {
        id: 3,
        score: 1,
        chapter_attempt: 2,
        selected_choices: [10],
        question_detail: dummyQuestions[2],
    },
];

export const dummyChapterAttempts: ChapterAttempt[] = [
    {
        id: 1,
        title: "Test 1",
        score: 2,
        completed_at: "2025-08-16T10:00:00Z",
        chapter_id: 1,
        order: [1, 2],
        question_attempts: dummyQuestionAttempts.filter((qa) => qa.chapter_attempt === 1),
    },
    {
        id: 2,
        title: "Test 2",
        score: 1,
        completed_at: "2025-08-16T11:00:00Z",
        chapter_id: 2,
        order: [3],
        question_attempts: dummyQuestionAttempts.filter((qa) => qa.chapter_attempt === 2),
    },
];