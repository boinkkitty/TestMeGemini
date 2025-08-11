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