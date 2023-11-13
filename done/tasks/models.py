from django.db import models
from django.core.validators import MinValueValidator

class Assignee(models.Model):
    name = models.CharField(max_length=20)
    

class Context(models.Model):
    name = models.CharField(max_length=20)
    
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
        ("Co", "Completed"),
        ("Cn", "Cancelled"),
        ("De", "Delegated"),
        ("Ip", "In Process"),
        ("Ns", "Not Started"),
        ("Wa", "Wait for"),
    ]
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
        ("Co", "Completed"),
        ("Cn", "Cancelled"),
        ("De", "Delegated"),
        ("Ip", "In Process"),
        ("Ns", "Not Started"),
        ("Wa", "Wait for"),
    ]
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