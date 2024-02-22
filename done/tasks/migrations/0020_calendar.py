# Generated by Django 4.2.6 on 2024-02-22 05:30

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tasks', '0019_alter_projects_project_status_alter_tasks_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='Calendar',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_title', models.CharField(max_length=200)),
                ('event_start', models.DateTimeField()),
                ('event_end', models.DateTimeField()),
                ('event_allDay', models.BooleanField(default=False)),
                ('event_taskId', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tasks.tasks')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
