from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views import View
from tasks.models import Projects, Tasks
from tasks.forms import QuickTaskEntry, NewTaskOrganizerTaskForm, NewTaskOrganizerProjectForm, Context, Assignee
from .manager import project_priority_dict, task_priority_dict
from django.core import serializers
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def home(request):
    return render(request, 'tasks/index.html')

def QuickTaskEntryView(request):
    quick_task_entry = QuickTaskEntry()

    if request.POST:
        quick_task_entry = QuickTaskEntry(request.POST)
        task_query_dict = request.POST                               #get the task list as QueryDict
        task_list = task_query_dict.getlist('name', default=None)    #transform the QueryDict Content to list
        task_single = task_list[0].split("\r\n")                     #split task list into single tasks
        if quick_task_entry.is_valid():
            for t in task_single:
                if t != "":                                         #skip empty entries
                    task_name = Tasks(name=t)                       #set the task description into name
                    print(task_name)
                    task_name.save()
                else:
                    print("there is a problem the form is not valid")
            quick_task_entry = QuickTaskEntry()                     #reset the form

    return render(request, 'tasks/quick-task-entry.html', {'quick_task_entry': quick_task_entry})

def NewTaskOrganizerWelcome(request):

    try:
        task_qty = Tasks.objects.filter(new_task=1).count()             # count the total amount of new entries
        new_task_name = Tasks.objects.filter(new_task=1)[0].name        # get the entry name to proceed
        
        initial_data_task = {'name': new_task_name}                     # autofill with entry name to proceed
        projects = Projects.objects.all()                               # get the list of existing projects
        initial_data_project = {'project_name': new_task_name}          # autofill with entry name to proceed
        object_id = Tasks.objects.filter(new_task=1)[0].pk              # get the primary key of the entry to proceed
        obj = Tasks.objects.get(pk=object_id)                           # get the instance of the entry to proceed
        form = NewTaskOrganizerTaskForm(
            initial=initial_data_task,
            instance=obj)                                               # display task form with auto filled data
        form_task = NewTaskOrganizerTaskForm()                          # used in default screen and non actionable screen
        form_project = NewTaskOrganizerProjectForm(
            initial=initial_data_project,
            instance=obj)                                               # display project form with auto filled data
        project = form.fields['parent'].queryset                        #call the choices list of the 'parent' field
        
        return render(request, 'tasks/new-task-o-wizard.html', {
            'form': form,
            'form_task': form_task,
            'form_project': form_project,
            'task_qty': task_qty,
            'new_task_name': new_task_name,
            'projects' : projects,
            'count': project.count(),
            'project': project,
        }) 
    except IndexError:
        return render(request, 'tasks/new-task-o-wizard-completed.html')

def NewTaskOrganizerSubmitTask(request):
    form = NewTaskOrganizerTaskForm()                               # initialize variable ???
    object_id = Tasks.objects.filter(new_task=1)[0].pk              # get the primary key of the entry to proceed
    obj = Tasks.objects.get(pk=object_id)                           # get the instance of the entry to proceed
    
    if request.method == 'POST':
        form = NewTaskOrganizerTaskForm(request.POST, instance=obj)
        if form.is_valid():
            form.save()                                             # This saves the data to the database
            # set the value of compound priority
            task = Tasks.objects.get(pk=object_id)
            # parent_priority = task.parent.project_priority
            calculated_compound_priority = task_priority_dict(task.priority) * 100/3
            task.compound_priority = calculated_compound_priority
            task.save()
            



    return render(request, 'tasks/new-task-o-wizard.html')

def NewTaskOrganizerSubmitProject(request):
    form_project = NewTaskOrganizerProjectForm()
    form_task = NewTaskOrganizerTaskForm()
    
    if request.method == 'POST':
        #save the project
        form_project = NewTaskOrganizerProjectForm(request.POST)
        form_task = NewTaskOrganizerTaskForm(request.POST)
        for field_name, field_value in request.POST.items():
            print(f"Field: {field_name}, Value: {field_value}")
        
        if form_project.is_valid():
            form_project.save()

        # #add task with project as parent/below is not working. need to get the task name and save it to a new entry in Task model with related parent.
        # # it's saving the same task name in both Task and Project Model
            form_task.save()
            last_entry = Tasks.objects.last()
            last_entry.parent = Projects.objects.last()
            last_entry.new_task = False
            last_entry.save()
            Tasks.objects.filter(new_task=1)[0].delete()
    
    return render(request, 'tasks/new-task-o-wizard.html')

def NewTaskOrganizerDelete(request):
    object_id = Tasks.objects.filter(new_task=1)[0].pk              # get the primary key of the entry to proceed
    obj = Tasks.objects.get(pk=object_id)                           # get the instance of the entry to proceed
    if request.method == 'POST':
        print('delete tag detected')
        obj.delete()
    return render(request, 'tasks/new-task-o-wizard.html')

def project_filter_results_view(request):
    query = request.GET.get('search', '')
    form = NewTaskOrganizerTaskForm()
    project = form.fields['parent'].queryset    
    if query:
        project = project.filter(project_name__icontains=query)
    else:
        project = form.fields['parent'].queryset
    context = {'project': project, 'count': project.count(), 'form':form}
    return render(request, 'tasks/project_filter_results.html', context)

def Prioritizer(request):
    all_tasks=Tasks.objects.all()
    all_projects=Projects.objects.all()
    context_options = Context.objects.values_list('name', flat=True)
    context_options_list = list(context_options)
    assignee_options = Assignee.objects.values_list('name', flat=True)
    assignee_options_list = list(assignee_options)
    # task_form = Task_Form()

    return render(request,
                "tasks/prioritizer.html",
                {'tasks':all_tasks,
                'projects':all_projects,
                'context_options_list':context_options_list,
                'assignee_options_list':assignee_options_list})

# TESTS
@csrf_exempt
def save_tasks(request):
    id=request.POST.get('id','')
    type=request.POST.get('type','')
    value=request.POST.get('value','')
    task=Tasks.objects.get(id=id)
        
    if type=="complete":
        task.complete=value

    if type == "priority":
        task.priority = value                  # set the priority value in the task instance
        # if parent_priority = task.parent.project_priority returns an error then replace project_priority_dict(parent_priority) with 1
        if task.parent == None:
            calculated_compound_priority = task_priority_dict(value) * 100/3
        else:
            parent_priority = task.parent.project_priority      # get the parent priority value
            calculated_compound_priority = project_priority_dict(parent_priority) * task_priority_dict(task.priority) * 100/3
        task.compound_priority = calculated_compound_priority

    if type == "name":
        task.name = value

    if type == "effort":
        task.effort = value

    if type == "context":
        # Retrieve the Context instance based on the provided value
        context_instance, created = Context.objects.get_or_create(name=value)
        task.context = context_instance

    if type == "deadline":
        task.deadline = value

    if type == "assignee":
        # Retrieve the Context instance based on the provided value
        assignee_instance, created = Assignee.objects.get_or_create(name=value)
        task.assignee = assignee_instance

    task.save()
    return JsonResponse({"success":"Updated"})

@csrf_exempt
def save_projects(request):
    id=request.POST.get('id','')
    type=request.POST.get('type','')
    value=request.POST.get('value','')
    project=Projects.objects.get(id=id)
        
    if type=="complete":
        project.project_complete=value

    if type == "priority":
        project.project_priority = value
        # get the list of tasks related to the project
        tasks = Tasks.objects.filter(parent=project)
        # update the priority of each task
        for task in tasks:
            # get the task priority value
            calculated_compound_priority = project_priority_dict(value) * task_priority_dict(task.priority) * 100/3
            task.compound_priority = calculated_compound_priority
            task.save()

    if type == "name":
        project.project_name = value
        
    if type == "deadline":
        project.project_deadline = value

    project.save()
    return JsonResponse({"success":"Updated"})

# delete completed tasks
@csrf_exempt
def delete_completed_tasks(request):
    checked_items = request.POST.getlist('checked_items[]')
    Tasks.objects.filter(pk__in=checked_items).delete()
    return JsonResponse({'status': 'success'})

# delete completed projects
@csrf_exempt
def delete_completed_projects(request):
    checked_items = request.POST.getlist('checked_items[]')
    Projects.objects.filter(pk__in=checked_items).delete()
    return JsonResponse({'status': 'success'})





def api_tasks_compound_priorities(request):
    tasks = Tasks.objects.all()
    tasks_serialized = serializers.serialize('json', tasks)
    tasks_list = json.loads(tasks_serialized)
    return JsonResponse(tasks_list, safe=False)


# return the priority value of a task upon change (works with JS file)
class CompoundPriorityView(View):
    def get(self, request, *args, **kwargs):
        task_id = request.GET.get('task_id')
        task = Tasks.objects.get(id=task_id)
        compound_priority = task.compound_priority
        return JsonResponse({'compound_priority': compound_priority})
    
