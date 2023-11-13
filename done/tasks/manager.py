def project_priority_dict(priority):
    project_priority_dict = {
        "A": 2,
        "B": 1.5,
        "C": 0.75,
        "D": 0.5,
        "other" : 1,
    }
    return project_priority_dict.get(priority, 1)

def task_priority_dict(priority):
    task_priority_dict = {
        "A": 1.5,
        "B": 1.2,
        "C": 0.75,
        "D": 0.5,
        "other" : 1,
    }
    return task_priority_dict.get(priority, 1)

# priority = input("Enter priority: ")
# print(priority)
# print(project_priority_dict(priority))