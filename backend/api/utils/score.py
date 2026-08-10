"""
Scoring utility functions for quiz attempts.
Includes logic for scoring MRQ, MCQ, and TF questions.
"""

from questions.models import Question

def get_score(question, selected_choice_ids, correct_choices) -> float:
    """
    Calculate the score for a question attempt based on selected and correct choices.
    
    Args:
        question (Question): The question instance.
        selected_choice_ids (set): The set of selected choice IDs.
        correct_choices (set): The set of correct choice IDs.
        
    Returns:
        float: The calculated score (partial for MRQ, 1/0 for MCQ/TF).
    """
    # MRQ: partial credit with an equal penalty for each incorrect selection.
    # This prevents selecting every option from receiving full credit.
    if question.question_type == Question.QuestionType.MRQ:
        selected_set = set(selected_choice_ids)
        correct_set = set(correct_choices)
        if not correct_set:  # no correct choices
            return 0.0
        correct_selected = len(selected_set & correct_set)
        incorrect_selected = len(selected_set - correct_set)
        return max(0.0, (correct_selected - incorrect_selected) / len(correct_set))

    # MCQ/TF: score 1 if exact match, else 0
    return 1.0 if selected_choice_ids == correct_choices else 0.0
