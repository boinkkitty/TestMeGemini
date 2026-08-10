from django.db import migrations, models


def snapshot_existing_attempts(apps, schema_editor):
    QuestionAttempt = apps.get_model("attempts", "QuestionAttempt")
    database = schema_editor.connection.alias

    attempts = (
        QuestionAttempt.objects.using(database)
        .select_related("question")
        .prefetch_related("question__choices", "selected_choices")
    )
    pending = []
    for attempt in attempts.iterator(chunk_size=500):
        question = attempt.question
        attempt.question_snapshot = {
            "id": question.id,
            "chapter": question.chapter_id,
            "question_text": question.question_text,
            "question_type": question.question_type,
            "choices": [
                {
                    "id": choice.id,
                    "text": choice.text,
                    "is_correct": choice.is_correct,
                }
                for choice in question.choices.all()
            ],
            "created_at": question.created_at.isoformat(),
        }
        attempt.selected_choices_snapshot = [
            choice.id for choice in attempt.selected_choices.all()
        ]
        pending.append(attempt)
        if len(pending) == 500:
            QuestionAttempt.objects.using(database).bulk_update(
                pending,
                ["question_snapshot", "selected_choices_snapshot"],
            )
            pending.clear()

    if pending:
        QuestionAttempt.objects.using(database).bulk_update(
            pending,
            ["question_snapshot", "selected_choices_snapshot"],
        )


class Migration(migrations.Migration):
    dependencies = [
        ("attempts", "0003_alter_chapterattempt_chapter_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="questionattempt",
            name="question_snapshot",
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name="questionattempt",
            name="selected_choices_snapshot",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="questionattempt",
            name="scoring_version",
            field=models.CharField(default="v1", max_length=20),
        ),
        migrations.RunPython(snapshot_existing_attempts, migrations.RunPython.noop),
    ]
