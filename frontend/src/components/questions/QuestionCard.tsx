"use client";

import { Question } from "@/lib/types";

type QuestionCardProps = {
    question: Question;
    selected?: number[];
    onSelect: (choiceId: number) => void;
    submitted: boolean;
};

function QuestionCard({ question, selected = [], onSelect, submitted }: QuestionCardProps) {
    if (!question) return null;

    const isMRQ = question.question_type === "MRQ";

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
            {/* Question text */}
            <p className="text-[15px] font-semibold text-foreground leading-relaxed tracking-tight">
                {question.question_text}
            </p>

            {/* Choices */}
            <div className="flex flex-col gap-2.5">
                {question.choices.map(choice => {
                    const isSelected = selected.includes(choice.id);
                    const isCorrect = choice.is_correct;

                    let stateClass = "border-border hover:border-primary/40 hover:bg-accent/50";
                    let indicatorClass = "border-border";
                    let indicatorFill: string | null = null;
                    let labelClass = "text-foreground";
                    let sideTag: React.ReactNode = null;

                    if (submitted) {
                        if (isCorrect && isSelected) {
                            stateClass = "border-green-500 bg-green-50";
                            indicatorClass = "border-green-500";
                            indicatorFill = "bg-green-500";
                            labelClass = "text-green-800 font-semibold";
                            sideTag = <span className="ml-auto text-[11px] font-bold text-green-700 whitespace-nowrap">✓ Correct</span>;
                        } else if (isCorrect && !isSelected) {
                            stateClass = "border-green-400 bg-green-50/60";
                            indicatorClass = "border-green-400";
                            labelClass = "text-green-700";
                            sideTag = <span className="ml-auto text-[11px] font-bold text-green-600 whitespace-nowrap">Correct answer</span>;
                        } else if (!isCorrect && isSelected) {
                            stateClass = "border-red-400 bg-red-50";
                            indicatorClass = "border-red-400";
                            indicatorFill = "bg-red-400";
                            labelClass = "text-red-800";
                            sideTag = <span className="ml-auto text-[11px] font-bold text-red-600 whitespace-nowrap">✗ Your pick</span>;
                        }
                    } else if (isSelected) {
                        stateClass = "border-primary bg-accent";
                        indicatorClass = "border-primary";
                        indicatorFill = "bg-primary";
                        labelClass = "text-primary font-semibold";
                    }

                    return (
                        <button
                            key={choice.id}
                            onClick={() => !submitted && onSelect(choice.id)}
                            disabled={submitted}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-[1.5px] text-left transition-all duration-100 ${stateClass} ${submitted ? "cursor-default" : "cursor-pointer"}`}
                        >
                            {/* Radio / Checkbox indicator */}
                            <div className={`flex-shrink-0 w-[18px] h-[18px] border-2 ${isMRQ ? "rounded" : "rounded-full"} ${indicatorClass} flex items-center justify-center transition-colors`}>
                                {indicatorFill && (
                                    <div className={`${isMRQ ? "w-2.5 h-2.5 rounded-sm" : "w-2 h-2 rounded-full"} ${indicatorFill}`} />
                                )}
                            </div>

                            {/* Choice text */}
                            <span className={`text-sm flex-1 ${labelClass}`}>{choice.text}</span>

                            {/* Side tag (submitted state) */}
                            {sideTag}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default QuestionCard;
