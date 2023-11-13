
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'done.settings'
from django.conf import settings
settings.configure(INSTALLED_APPS=['tasks'])
from models import Tasks




project_priority_dict = {
    "A": 2,
    "B": 1.5,
    "C": 0.75,
    "D": 0.5,
    "other" : 1,
}

task_priority_dict = {
    "A": 1.5,
    "B": 1.2,
    "C": 0.75,
    "D": 0.5,
    "other" : 1,
}

key = "KL"  # replace this with the key you want to use
value = project_priority_dict.get(key, 1)
print(value)

qs = Tasks.objects.all()
for task in qs:
    print(task.name)
    task_priority = task_priority_dict().get(task.priority, 1)
    print(task_priority)