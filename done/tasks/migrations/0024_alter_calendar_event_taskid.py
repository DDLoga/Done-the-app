# Generated by Django 4.2.6 on 2024-03-05 10:20

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0023_calendar_last_sync'),
    ]

    operations = [
        migrations.AlterField(
            model_name='calendar',
            name='event_taskId',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='tasks.tasks'),
        ),
    ]