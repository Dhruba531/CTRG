"""
Split Stage2Review.comments into technical_comments and budget_comments.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reviews', '0004_remove_reviewassignment_review_reviewer_status_idx_and_more'),
    ]

    operations = [
        # Rename existing comments -> technical_comments
        migrations.RenameField(
            model_name='stage2review',
            old_name='comments',
            new_name='technical_comments',
        ),
        migrations.AlterField(
            model_name='stage2review',
            name='technical_comments',
            field=models.TextField(
                help_text='Comments on how PI addressed technical and methodological concerns',
            ),
        ),
        # Add new budget_comments field
        migrations.AddField(
            model_name='stage2review',
            name='budget_comments',
            field=models.TextField(
                blank=True,
                default='',
                help_text='Comments on budget revisions and justifications (if applicable)',
            ),
        ),
    ]
