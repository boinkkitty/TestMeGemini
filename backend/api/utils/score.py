from questions.models import Question


def get_score(question, selected_choice_ids, correct_choices) -> float:
    selected_set = set(selected_choice_ids)
    correct_set = set(correct_choices)

    # MRQ: reward correct selections, penalize incorrect ones, floor at 0
    if question.question_type == Question.QuestionType.MRQ:
        if not correct_set:
            return 0.0
        correct_selected = len(selected_set & correct_set)
        incorrect_selected = len(selected_set - correct_set)
        score = (correct_selected - incorrect_selected) / len(correct_set)
        return max(0.0, score)

    # MCQ/TF: exact match
    return 1.0 if selected_set == correct_set else 0.0
