# Generated by Django 4.2.6 on 2023-10-11 13:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Assignee',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Context',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Tasks',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('priority', models.CharField(choices=[('A', 'High importance'), ('B', 'Important'), ('C', 'Secondary'), ('D', 'Not Important')], max_length=1)),
                ('status', models.CharField(choices=[('Co', 'Completed'), ('Cn', 'Cancelled'), ('De', 'Delegated'), ('Ip', 'In Process'), ('Ns', 'Not Started'), ('Wa', 'Wait for')], max_length=2)),
                ('complete', models.BooleanField(default=False)),
                ('name', models.CharField(max_length=200)),
                ('deadline', models.DateField()),
                ('effort', models.IntegerField()),
                ('assignee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tasks.assignee')),
                ('context', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tasks.context')),
            ],
        ),
    ]