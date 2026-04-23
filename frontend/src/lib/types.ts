
export type UserInfo = {
    id: number;
    username: string;
    email: string;
};

export type Chapter = {
    id: number;
    title: string;
    description: string;
    category: string;
    questions?: Question[];
};

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
    category: string;
    score: number;
    max_score: number;
    completed_at: string;
    chapter: number; // Foreign key to Chapter
    chapter_id?: number; // For compatibility with dummy data and backend write
    order?: Array<number>;
    question_attempts?: QuestionAttempt[];
};

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
};

export type QuestionAttemptInput = {
    question_id: number;
    selected_choices: number[];
}