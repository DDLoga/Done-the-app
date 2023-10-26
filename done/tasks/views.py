from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Tasks, Projects
from tasks.forms import QuickTaskEntry, NewTaskOrganizerForm, TestForm

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
    task_count=1                                                    # initialize counter
    task_qty = Tasks.objects.filter(new_task=1).count()             # count the total amount of new entries
    new_task_name = Tasks.objects.filter(new_task=1)[0].name        # get the entry name to proceed
    initial_data = {'name': new_task_name}                          # autofill with entry name to proceed
    projects = Projects.objects.all()                               # get the list of existing projects
    initial_data = {'name': new_task_name}                          # autofill with entry name to proceed
    projects = Projects.objects.all()                               # get the list of existing projects
    object_id = Tasks.objects.filter(new_task=1)[0].pk              # get the primary key of the entry to proceed
    obj = Tasks.objects.get(pk=object_id)                           # get the instance of the entry to proceed
    form = NewTaskOrganizerForm(initial=initial_data, instance=obj)           # display form with auto filled data
    
    return render(request, 'tasks/new-task-o-wizard.html', {
        'form': form,
        'task_count': task_count,
        'task_qty': task_qty,
        'new_task_name': new_task_name,
        'projects' : projects,
    }) 

def NewTaskOrganizerSubmitTask(request):
    task_count=1                                                    # initialize counter
    form = NewTaskOrganizerForm()                                   # initialize variable ???
    object_id = Tasks.objects.filter(new_task=1)[0].pk              # get the primary key of the entry to proceed
    obj = Tasks.objects.get(pk=object_id)                           # get the instance of the entry to proceed
    
    
    if request.method == 'POST':
        form = NewTaskOrganizerForm(request.POST, instance=obj)
        if form.is_valid():
            form.save()                                             # This saves the data to the database
            task_count = task_count + 1

            # print('delete tag detected')
            # obj.delete()

    return render(request, 'tasks/new-task-o-wizard.html')


# TESTS


def Test(request):
    name = Tasks.objects.all()
    return render(request, 'tasks/test_page.html', {'name': name})

def test_form_view(request):
    name = Tasks.objects.all()
    if request.method == 'POST':
        form = TestForm(request.POST)
        if form.is_valid():
            form.save()  # This saves the data to the database
            return redirect('success_page')  # Redirect to a success page
    else:
        form = TestForm()
    
    return render(request, 'tasks/test_page.html', {'form': form,'name': name})


# what's inside a form post:
#         for field_name, field in form.fields.items():
#             print(f"Field Name: {field_name}")
#             print(f"Field Value: {form[field_name].value()}")

# what are the errors while posting a form:
#             else:
#             errors = form.errors
#             print(errors)