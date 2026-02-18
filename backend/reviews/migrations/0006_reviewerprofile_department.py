"""
Add department field to ReviewerProfile.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reviews', '0005_split_stage2_comments_into_technical_and_budget'),
    ]

    operations = [
        migrations.AddField(
            model_name='reviewerprofile',
            name='department',
            field=models.CharField(
                blank=True,
                default='',
                help_text="Reviewer's department",
                max_length=255,
            ),
        ),
    ]
