# Generated by Django 4.2.6 on 2023-10-14 10:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tasks',
            name='deadline',
            field=models.DateField(blank=True, null=True),
        ),
    ]