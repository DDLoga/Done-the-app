from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

class Assignee(models.Model):
    name = models.CharField(max_length=20)
    description = models.CharField(max_length=200, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return self.name

class Context(models.Model):
    name = models.CharField(max_length=20)
    description = models.CharField(max_length=200, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name

class Projects(models.Model):
    PRIORITIES = [
        ("A", "A"),
        ("B", "B"),
        ("C", "C"),
        ("D", "D"),
    ]
    STATUSES = [
        ('', 'No Status'),
        ("Co", "Completed"),
        ("Cn", "Cancelled"),
        ("De", "Delegated"),
        ("Ip", "In Process"),
        ("Ns", "Not Started"),
        ("Wa", "Wait for"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project_priority = models.CharField(max_length=1, choices=PRIORITIES, null=True, blank=True)
    project_status = models.CharField(max_length=2, choices=STATUSES)
    project_complete = models.BooleanField(default=False)
    project_name = models.CharField(max_length=200)
    project_deadline = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.project_name


class Tasks(models.Model):
    PRIORITIES = [
        ("A", "A"),
        ("B", "B"),
        ("C", "C"),
        ("D", "D"),
    ]
    STATUSES = [
        ('', 'No Status'),
        ("Co", "Completed"),
        ("Cn", "Cancelled"),
        ("De", "Delegated"),
        ("Ip", "In Process"),
        ("Ns", "Not Started"),
        ("Wa", "Wait for"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    priority = models.CharField(max_length=1, choices=PRIORITIES, null=True, blank=True)
    status = models.CharField(max_length=2, choices=STATUSES, default='Ns')
    complete = models.BooleanField(default=False)
    name = models.CharField(max_length=200)
    deadline = models.DateField(null=True, blank=True)
    context = models.ForeignKey(Context, on_delete=models.CASCADE,null=True, blank=True)
    effort = models.IntegerField(null=True, blank=True)
    assignee = models.ForeignKey(Assignee, on_delete=models.CASCADE, null=True, blank=True)
    parent = models.ForeignKey(Projects, on_delete=models.CASCADE, null=True, blank=True)
    new_task = models.BooleanField(default=True)
    compound_priority = models.IntegerField(null=True, blank=True)
    

class Calendar(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event_title = models.CharField(max_length=200)
    event_start = models.DateTimeField()
    event_end = models.DateTimeField()
    event_allDay = models.BooleanField(default=False)
    event_taskId = models.ForeignKey(Tasks, on_delete=models.CASCADE, null=True)
    last_updated = models.DateTimeField(auto_now=True)  # existing field
    last_sync = models.DateTimeField(null=True)  # new field
    recurrence_rule = models.TextField(null=True)  # new field
    gcal_id = models.CharField(max_length=255, null=True, blank=True)  # new field

    def __str__(self):
        return self.event_title


class UserToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    access_token = models.CharField(max_length=200)
    refresh_token = models.CharField(max_length=200)
    last_gCal_sync = models.DateTimeField(null=True, blank=True)