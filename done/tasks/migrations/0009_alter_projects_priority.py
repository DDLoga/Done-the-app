# Generated by Django 4.2.6 on 2023-10-25 14:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0008_alter_tasks_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projects',
            name='priority',
            field=models.CharField(choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')], max_length=1),
        ),
    ]
