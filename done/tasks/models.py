from django.db import models

class Assignee(models.Model):
    name = models.CharField(max_length=20)
    

class Context(models.Model):
    name = models.CharField(max_length=20)
    
    def __str__(self):
        return self.name

class Projects(models.Model):
    PRIORITIES = [
        ("A", "Critical"),
        ("B", "Important"),
        ("C", "Secondary"),
        ("D", "Not Important"),
    ]
    STATUSES = [
        ("Co", "Completed"),
        ("Cn", "Cancelled"),
        ("De", "Delegated"),
        ("Ip", "In Process"),
        ("Ns", "Not Started"),
        ("Wa", "Wait for"),
    ]
    priority = models.CharField(max_length=1, choices=PRIORITIES)
    status = models.CharField(max_length=2, choices=STATUSES)
    complete = models.BooleanField(default=False)
    name = models.CharField(max_length=200)
    deadline = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.name


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
    priority = models.CharField(max_length=1, choices=PRIORITIES)
    status = models.CharField(max_length=2, choices=STATUSES, default='Ns')
    complete = models.BooleanField(default=False)
    name = models.CharField(max_length=200)
    deadline = models.DateField(null=True, blank=True)
    context = models.ForeignKey(Context, on_delete=models.CASCADE,null=True, blank=True)
    effort = models.IntegerField(null=True, blank=True)
    assignee = models.ForeignKey(Assignee, on_delete=models.CASCADE, null=True, blank=True)
    parent = models.ForeignKey(Projects, on_delete=models.CASCADE, null=True, blank=True)
    new_task = models.BooleanField(default=True)