# Generated by Django 4.2.6 on 2024-03-05 10:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0024_alter_calendar_event_taskid'),
    ]

    operations = [
        migrations.AddField(
            model_name='calendar',
            name='recurrence_rule',
            field=models.TextField(null=True),
        ),
    ]
