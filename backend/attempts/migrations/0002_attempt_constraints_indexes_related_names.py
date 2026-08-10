import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("attempts", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name="chapterattempt",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="chapter_attempts",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddIndex(
            model_name="chapterattempt",
            index=models.Index(fields=["user", "-completed_at"], name="attempt_user_completed_idx"),
        ),
        migrations.AddIndex(
            model_name="chapterattempt",
            index=models.Index(fields=["chapter", "-completed_at"], name="attempt_chapter_completed_idx"),
        ),
        migrations.AddIndex(
            model_name="questionattempt",
            index=models.Index(fields=["chapter_attempt", "attempted_at"], name="question_attempt_order_idx"),
        ),
        migrations.AddConstraint(
            model_name="chapterattempt",
            constraint=models.CheckConstraint(
                condition=models.Q(score__gte=0),
                name="chapter_attempt_score_nonnegative",
            ),
        ),
        migrations.AddConstraint(
            model_name="questionattempt",
            constraint=models.UniqueConstraint(
                fields=("chapter_attempt", "question"),
                name="unique_question_per_chapter_attempt",
            ),
        ),
        migrations.AddConstraint(
            model_name="questionattempt",
            constraint=models.CheckConstraint(
                condition=models.Q(score__gte=0, score__lte=1),
                name="question_attempt_score_range",
            ),
        ),
    ]
