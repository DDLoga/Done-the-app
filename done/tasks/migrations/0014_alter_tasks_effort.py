# Generated by Django 4.2.6 on 2023-10-29 14:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0013_alter_tasks_effort'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tasks',
            name='effort',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]