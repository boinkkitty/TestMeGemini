from question.models import Question

def get_score(question, selected_choice_ids, correct_choices) -> float:
    # MRQ: partial credit for each correct choice selected, no penalty for extra
    if question.question_type == Question.QuestionType.MRQ:
        selected_set = set(selected_choice_ids)
        correct_set = set(correct_choices)
        if not correct_set:  # no correct choices
            return 0.0
        # return fraction of correct choices selected
        return len(selected_set & correct_set) / len(correct_set)

    # MCQ/TF: score 1 if exact match, else 0
    return 1.0 if selected_choice_ids == correct_choices else 0.0
