from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Tasks, Projects
from tasks.forms import QuickTaskEntry, NewTaskOrganizerTaskForm, NewTaskOrganizerProjectForm, TestForm

def index(request):
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

    return render(request, 'tasks/index.html', {'quick_task_entry': quick_task_entry})


def NewTaskOrganizerWelcome(request):

    task_qty = Tasks.objects.filter(new_task=1).count()             # count the total amount of new entries
    new_task_name = Tasks.objects.filter(new_task=1)[0].name        # get the entry name to proceed
    
    initial_data_task = {'name': new_task_name}                          # autofill with entry name to proceed
    projects = Projects.objects.all()                               # get the list of existing projects
    initial_data_project = {'project_name': new_task_name}                          # autofill with entry name to proceed
    projects = Projects.objects.all()                               # get the list of existing projects
    object_id = Tasks.objects.filter(new_task=1)[0].pk              # get the primary key of the entry to proceed
    obj = Tasks.objects.get(pk=object_id)                           # get the instance of the entry to proceed
    form = NewTaskOrganizerTaskForm(initial=initial_data_task, instance=obj)           # display form with auto filled data
    form_task = NewTaskOrganizerTaskForm()
    form_project = NewTaskOrganizerProjectForm(initial=initial_data_project, instance=obj)
    
    return render(request, 'tasks/new-task-o-wizard.html', {
        'form': form,
        'form_task': form_task,
        'form_project': form_project,
        'task_qty': task_qty,
        'new_task_name': new_task_name,
        'projects' : projects,
    }) 

def NewTaskOrganizerSubmitTask(request):
    task_count=1                                                    # initialize counter
    form = NewTaskOrganizerTaskForm()                               # initialize variable ???
    object_id = Tasks.objects.filter(new_task=1)[0].pk              # get the primary key of the entry to proceed
    obj = Tasks.objects.get(pk=object_id)                           # get the instance of the entry to proceed
    
    if request.method == 'POST':
        form = NewTaskOrganizerTaskForm(request.POST, instance=obj)
        if form.is_valid():
            print(form)
            form.save()                                             # This saves the data to the database
            task_count = task_count + 1

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



# TESTS


def search_view(request):
    all_people = Projects.objects.all()
    context = {'count': all_people.count()}
    return render(request, 'tasks/search.html', context)


def search_results_view(request):
    query = request.GET.get('search', '')
    print(f'{query = }')

    all_people = Projects.objects.all()
    if query:
        people = all_people.filter(project_name__icontains=query)
    else:
        people = []

    context = {'people': people, 'count': all_people.count()}
    return render(request, 'tasks/search_results.html', context)