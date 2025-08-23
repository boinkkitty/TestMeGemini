import { Question } from "@/lib/types";

type QuestionCardProps = {
    question: Question;
    selected?: number[];
    onSelect: (choiceId: number) => void;
    submitted: boolean;
};

function QuestionCard({ question, selected, onSelect, submitted }: QuestionCardProps) {
    return (
        <div className="bg-white shadow-md rounded-md p-6 max-w-xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {question.question_text}
            </h3>
            <form>
                {question.choices.map((choice) => {
                    const isCorrect = choice.is_correct;
                    const isSelected = selected?.includes(choice.id);

                    let indicator = null;
                    if (submitted) {
                        if (isCorrect) {
                            indicator = <span className="text-green-600 ml-2">✔</span>;
                        } else if (isSelected && !isCorrect) {
                            indicator = <span className="text-red-600 ml-2">✘</span>;
                        }
                    }



                    return (
                        <div key={choice.id} className="mb-3">
                            <label
                                className="flex items-center cursor-pointer select-none text-gray-700"
                                htmlFor={`choice-${question.id}-${choice.id}`}
                            >
                                <input
                                    id={`choice-${question.id}-${choice.id}`}
                                    type={question.question_type === "MRQ" ? "checkbox" : "radio"}
                                    name={`question-${question.id}`}
                                    checked={!!isSelected}
                                    onChange={() => onSelect(choice.id)}
                                    disabled={submitted}
                                    className="form-checkbox text-blue-600 focus:ring-blue-500 rounded"
                                />
                                <span className="ml-2">{choice.text}</span>
                                {indicator}
                            </label>
                        </div>
                    );
                })}
            </form>
        </div>
    );
};

export default QuestionCard;
