from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse
from django.views import View
from tasks.models import Projects, Tasks
from tasks.forms import QuickTaskEntry, NewTaskOrganizerTaskForm, NewTaskOrganizerProjectForm, Context, Assignee
from .manager import project_priority_dict, task_priority_dict
from django.core import serializers
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.forms.models import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder



def home(request):
    # if user is authenticated, redirect to the prioritizer
    if request.user.is_authenticated:
        return render(request, 'tasks/index.html')
    else:
        # return render(request, 'account/login.html')
        return render(request, 'welcome.html')
        
    
def sorry(request):
    return render(request, 'sorry.html')
    
@login_required
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
                    task_name.user = request.user                   #set the user
                    task_name.save()
                else:
                    print("there is a problem the form is not valid")
            quick_task_entry = QuickTaskEntry()                     #reset the form

    return render(request, 'tasks/quick-task-entry.html', {'quick_task_entry': quick_task_entry})

@login_required
def NewTaskOrganizerWelcome(request):

    try:
        task_qty = Tasks.objects.filter(new_task=1, user=request.user).count()             # count the total amount of new entries
        new_task_name = Tasks.objects.filter(new_task=1, user=request.user)[0].name        # get the entry name to proceed
        
        initial_data_task = {'name': new_task_name}                     # autofill with entry name to proceed
        projects = Projects.objects.filter(user=request.user)                              # get the list of existing projects
        initial_data_project = {'project_name': new_task_name}          # autofill with entry name to proceed
        object_id = Tasks.objects.filter(new_task=1, user=request.user)[0].pk             # get the primary key of the entry to proceed
        obj = Tasks.objects.get(pk=object_id, user=request.user)                           # get the instance of the entry to proceed
        form = NewTaskOrganizerTaskForm(
            request.POST or None,
            initial=initial_data_task,
            instance=obj,
            user=request.user
        )                                          # display task form with auto filled data
        form_task = NewTaskOrganizerTaskForm()                          # used in default screen and non actionable screen
        form_project = NewTaskOrganizerProjectForm(
            initial=initial_data_project,
            instance=obj)                                               # display project form with auto filled data
        # filter the 'parent' field queryset to only include projects related to the currently logged-in user
        form.fields['parent'].queryset = Projects.objects.filter(user=request.user)
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

@login_required
def NewTaskOrganizerSubmitTask(request):
    form = NewTaskOrganizerTaskForm()                               # initialize variable ???
    object_id = Tasks.objects.filter(new_task=1, user=request.user)[0].pk             # get the primary key of the entry to proceed
    obj = Tasks.objects.get(pk=object_id, user=request.user)                           # get the instance of the entry to proceed
    
    if request.method == 'POST':
        form = NewTaskOrganizerTaskForm(request.POST, instance=obj)
        if form.is_valid():
            form.user = request.user
            form.save()                                             # This saves the data to the database
            # set the value of compound priority
            task = Tasks.objects.get(pk=object_id, user=request.user)
            # parent_priority = task.parent.project_priority
            calculated_compound_priority = task_priority_dict(task.priority) * 100/3
            task.compound_priority = calculated_compound_priority
            task.user = request.user
            task.save()
            



    return render(request, 'tasks/new-task-o-wizard.html')

@login_required
def NewTaskOrganizerSubmitProject(request):
    form_project = NewTaskOrganizerProjectForm()
    form_task = NewTaskOrganizerTaskForm()
    
    if request.method == 'POST':
        #save the project
        form_project = NewTaskOrganizerProjectForm(request.POST)
        form_task = NewTaskOrganizerTaskForm(request.POST)

        if form_project.is_valid():
            project_instance = form_project.save(commit=False)
            project_instance.user = request.user
            project_instance.save()

        # #add task with project as parent/below is not working. need to get the task name and save it to a new entry in Task model with related parent.
        # # it's saving the same task name in both Task and Project Model
            task_instance = form_task.save(commit=False)
            task_instance.user = request.user
            task_instance.save()
            
            last_entry = Tasks.objects.filter(user=request.user).last()
            last_entry.parent = Projects.objects.filter(user=request.user).last()
            last_entry.new_task = False
            last_entry.user = request.user
            last_entry.save()
            Tasks.objects.filter(new_task=1, user=request.user)[0].delete()
    
    return render(request, 'tasks/new-task-o-wizard.html')

@login_required
def NewTaskOrganizerDelete(request):
    object_id = Tasks.objects.filter(new_task=1, user=request.user)[0].pk              # get the primary key of the entry to proceed
    obj = Tasks.objects.get(pk=object_id, user=request.user)                          # get the instance of the entry to proceed
    if request.method == 'POST':
        obj.delete()
    return render(request, 'tasks/new-task-o-wizard.html')

@login_required
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

@login_required
def Prioritizer(request):
    return render(request,"tasks/prioritizer.html")
    
@login_required
def table_task(request):
    all_tasks = Tasks.objects.filter(user=request.user)
    context_options = Context.objects.filter(user=request.user).values_list('name', flat=True)
    context_options_list = list(context_options)
    assignee_options = Assignee.objects.filter(user=request.user).values_list('name', flat=True)
    assignee_options_list = list(assignee_options)
    return render(request,
                'tasks/table_task.html',
                {'tasks':all_tasks,
                'context_options_list':context_options_list,
                'assignee_options_list':assignee_options_list})

@login_required
def table_project(request):
    all_projects=Projects.objects.filter(user=request.user)
    context_options = Context.objects.values_list('name', flat=True)
    context_options_list = list(context_options)
    assignee_options = Assignee.objects.values_list('name', flat=True)
    assignee_options_list = list(assignee_options)
    return render(request,
                'tasks/table_project.html',
                {'projects':all_projects,
                'context_options_list':context_options_list,
                'assignee_options_list':assignee_options_list})

@login_required
def contexts(request):
    context = Context.objects.filter(user=request.user)
    return render(request, 'tasks/contexts.html', {'context': context})

@csrf_exempt
def update_context(request):
    if request.method == 'POST':
        id = request.POST.get('id')
        field = request.POST.get('field')
        value = request.POST.get('value')
        context = Context.objects.get(id=id)
        setattr(context, field, value)
        context.save()
        return JsonResponse({'status': 'success'}, status=200)
    return JsonResponse({'status': 'error'}, status=400)

@csrf_exempt
def add_context(request):
    if request.method == 'POST':
        context = Context(name='New context', description='New description')
        context.user = request.user
        context.save()
        context_id = context.pk
        return JsonResponse({'name': context.name, 'description': context.description, 'id': context_id}, status=200)
    return JsonResponse({'status': 'error'}, status=400)

@csrf_exempt
def delete_context(request):
    if request.method == 'POST':
        selected = request.POST.getlist('selected[]')
        Context.objects.filter(id__in=selected, user=request.user).delete()
        return JsonResponse({'status': 'success'}, status=200)
    return JsonResponse({'status': 'error'}, status=400)

@login_required
def assignees(request):
    assignee = Assignee.objects.filter(user=request.user)
    return render(request, 'tasks/assignees.html', {'assignee': assignee})

@csrf_exempt
def update_assignee(request):
    if request.method == 'POST':
        id = request.POST.get('id')
        field = request.POST.get('field')
        value = request.POST.get('value')
        assignee = Assignee.objects.get(id=id)
        setattr(assignee, field, value)
        assignee.save()
        return JsonResponse({'status': 'success'}, status=200)
    return JsonResponse({'status': 'error'}, status=400)

@csrf_exempt
def add_assignee(request):
    if request.method == 'POST':
        assignee = Assignee(name='New assignee', description='New description')
        assignee.user = request.user
        assignee.save()
        assignee_id = assignee.pk
        return JsonResponse({'name': assignee.name, 'description': assignee.description, 'id' : assignee_id}, status=200)
    return JsonResponse({'status': 'error'}, status=400)

@csrf_exempt
def delete_assignee(request):
    if request.method == 'POST':
        selected = request.POST.getlist('selected[]')
        Assignee.objects.filter(id__in=selected, user=request.user).delete()
        return JsonResponse({'status': 'success'}, status=200)
    return JsonResponse({'status': 'error'}, status=400)




@login_required
@csrf_exempt
def save_tasks(request):
    id=request.POST.get('id','')
    type=request.POST.get('type','')
    value=request.POST.get('value','')
    task = Tasks.objects.get(id=id, user=request.user)
        
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

    task.user = request.user
    task.save()
    return JsonResponse({"success":"Updated"})

@login_required
@csrf_exempt
def save_projects(request):
    id=request.POST.get('id','')
    type=request.POST.get('type','')
    value=request.POST.get('value','')
    project = Projects.objects.get(id=id, user=request.user)
        
    if type=="complete":
        project.project_complete=value

    if type == "priority":
        project.project_priority = value
        # get the list of tasks related to the project
        tasks = Tasks.objects.filter(parent=project, user=request.user)
        # update the priority of each task
        for task in tasks:
            # get the task priority value
            calculated_compound_priority = project_priority_dict(value) * task_priority_dict(task.priority) * 100/3
            task.compound_priority = calculated_compound_priority
            task.user = request.user
            task.save()

    if type == "name":
        project.project_name = value
        
    if type == "deadline":
        project.project_deadline = value

    project.user = request.user
    project.save()
    return JsonResponse({"success":"Updated"})

# delete completed tasks
@login_required
@csrf_exempt
def delete_completed_tasks(request):
    checked_items = request.POST.getlist('checked_items[]')
    Tasks.objects.filter(pk__in=checked_items, user=request.user).delete()
    return JsonResponse({'status': 'success'})

# delete completed projects
@login_required
@csrf_exempt
def delete_completed_projects(request):
    if request.method == 'POST':
        checked_items = request.POST.getlist('id')
        Projects.objects.filter(pk__in=checked_items, user=request.user).delete()
        return JsonResponse({'status': 'success'}, status=200)
    return JsonResponse({'status': 'error'}, status=400)


@login_required
def api_tasks_compound_priorities(request):
    tasks = Tasks.objects.filter(user=request.user)
    tasks_serialized = serializers.serialize('json', tasks)
    tasks_list = json.loads(tasks_serialized)
    return JsonResponse(tasks_list, safe=False)


@csrf_exempt
def update_projects(request):
    try:
        if request.method == 'POST':
            id = request.POST.get('id')
            field = request.POST.get('field')
            value = request.POST.get('value')
            projects = Projects.objects.get(id=id)
            setattr(projects, field, value)
            projects.save()
            return JsonResponse({'status': 'success'}, status=200)
        return JsonResponse({'status': 'error'}, status=400)
    except Exception as e:
        error_message = str(e)
        print(error_message)
        return JsonResponse({'status': 'error'}, status=400)

@csrf_exempt
def add_project(request):
    if request.method == 'POST':
        project = Projects(project_name='New Project Name')
        project.user = request.user
        project.save()
        # get the pk of the new project
        project_id = project.pk
        return JsonResponse({'name': project.project_name, 'project_id': project_id}, status=200)
    return JsonResponse({'status': 'error'}, status=400)

@csrf_exempt
def update_tasks(request):
    # try:
    if request.method == 'POST':
        id = request.POST.get('id')
        field = request.POST.get('field')
        value = request.POST.get('value')
        tasks = Tasks.objects.get(id=id)
        
        
        if field == 'context':
            value = get_object_or_404(Context, name=value)  # replace 'name' with the field you use to identify a Context instance
        
        if field == 'assignee':
            value = get_object_or_404(Assignee, name=value)  # replace 'name' with the field you use to identify a Context instance
        
        setattr(tasks, field, value)
        tasks.save()
        return JsonResponse({'status': 'success'}, status=200)
    return JsonResponse({'status': 'error'}, status=400)




class CompoundPriorityView(View):
    # return the priority value of a task upon change (works with JS file)
    def get(self, request, *args, **kwargs):
        task_id = request.GET.get('task_id')
        task = Tasks.objects.get(id=task_id, user=request.user)
        compound_priority = task.compound_priority
        return JsonResponse({'compound_priority': compound_priority})
    






########################################################################################
# V2 API with tabulator tasks management
########################################################################################

def user_tasks(request):
    tasks = Tasks.objects.filter(user=request.user)
    task_priorities = dict(Tasks.PRIORITIES)
    task_statuses = dict(Tasks.STATUSES)
    project_priorities = dict(Projects.PRIORITIES)
    project_statuses = dict(Projects.STATUSES)
    context_names = list(Context.objects.filter(user=request.user).values_list('name', flat=True))
    assignee_names = list(Assignee.objects.filter(user=request.user).values_list('name', flat=True))
    project_names = list(Projects.objects.filter(project_complete=False, user=request.user).values_list('project_name', flat=True))
    return render(request, 'tasks/apiV2_tasks.html', {'tasks': tasks,
                                                'project_priorities': project_priorities,
                                                'project_statuses': project_statuses,
                                                'task_priorities': task_priorities,
                                                'task_statuses': task_statuses,
                                                'context_names': context_names,
                                                'assignee_names': assignee_names,
                                                'project_names': project_names,
                                                })

@csrf_exempt
def update_task_v2(request):
    if request.method == 'POST':
        task_id = request.POST.get('id')
        field = request.POST.get('field')
        value = request.POST.get('value')

        task = Tasks.objects.get(id=task_id)

        if field in ["name", "effort", "priority", "deadline", 'status','context__name','assignee__name', 'complete','parent__project_name']:
            if field == 'context__name':
                value = Context.objects.get(name=value)
                field = 'context'
            if field == 'assignee__name':
                value = Assignee.objects.get(name=value)
                field = 'assignee'
            if field == 'parent__project_name':
                value = Projects.objects.get(project_name=value)
                field = 'parent'
            if field == 'complete':
                if value == 'true':
                    value = True
                else:
                    value = False
            setattr(task, field, value)

        task.user = request.user
        task.save()

        return JsonResponse({"status": "success"})

def get_tasks_v2(request):
    tasks = Tasks.objects.filter(user=request.user)
    tasks_list = list(tasks.values('id','name','priority','compound_priority','deadline','status','effort','context__name','assignee__name','parent__project_name', 'complete'))  # add other fields as needed
    return JsonResponse({'data': tasks_list})

@csrf_exempt
def create_task_v2(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        priority = request.POST.get('priority')
        try:
            # collect the parent project name
            parent_project_name = request.POST.get('parent__project_name')
            # get the parent project instance
            parent = Projects.objects.get(project_name=parent_project_name)
            # Get other fields as needed

            task = Tasks(name=name, priority=priority, parent=parent, user=request.user)
            # Set other fields as needed
        except:
            task = Tasks(name=name, priority=priority, user=request.user)


        task.save()

        return JsonResponse({'status': 'success', 'message': 'Task created successfully'})

    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request'})
    
@csrf_exempt
def delete_completed_tasks(request):
    if request.method == 'DELETE':
        Tasks.objects.filter(complete=True).delete()
        return JsonResponse({'success': True})
    
########################################################################################
# V2 API with tabulator project management
########################################################################################

def user_projects(request):
    projects = Projects.objects.filter(user=request.user)
    project_priorities = dict(Projects.PRIORITIES)
    project_statuses = dict(Projects.STATUSES)
    tasks = Tasks.objects.filter(user=request.user)
    task_priorities = dict(Tasks.PRIORITIES)
    task_statuses = dict(Tasks.STATUSES)
    context_names = list(Context.objects.filter(user=request.user).values_list('name', flat=True))
    assignee_names = list(Assignee.objects.filter(user=request.user).values_list('name', flat=True))
    project_names = list(Projects.objects.filter(project_complete=False, user=request.user).values_list('project_name', flat=True))
    return render(request, 'tasks/apiV2_projects.html', {'projects': projects,
                                                'project_priorities': project_priorities,
                                                'project_statuses': project_statuses,
                                                'tasks': tasks,
                                                'task_priorities': task_priorities,
                                                'task_statuses': task_statuses,
                                                'context_names': context_names,
                                                'assignee_names': assignee_names,
                                                'project_names': project_names,
                                                })

@csrf_exempt
def update_project_v2(request):
    if request.method == 'POST':
        project_id = request.POST.get('id')
        field = request.POST.get('field')
        value = request.POST.get('value')

        project = Projects.objects.get(id=project_id)

        if field in ["project_name", "project_priority", "project_deadline", 'project_status','project_complete']:
            if field == 'project_complete':
                if value == 'true':
                    value = True
                else:
                    value = False
            setattr(project, field, value)

        project.user = request.user
        project.save()

        return JsonResponse({"status": "success"})

def get_projects_v2(request):
    projects = Projects.objects.filter(user=request.user)
    projects_list = list(projects.values('id','project_name','project_priority','project_deadline','project_status','project_complete'))  # add other fields as needed
    return JsonResponse({'data': projects_list})

@csrf_exempt
def create_project_v2(request):
    if request.method == 'POST':
        project_name = request.POST.get('project_name')
        project_priority = request.POST.get('project_priority')
        # Get other fields as needed

        project = Projects(project_name=project_name, project_priority=project_priority, user=request.user)
        # Set other fields as needed

        project.save()

        return JsonResponse({'status': 'success', 'message': 'Project created successfully'})

    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request'})
    
@csrf_exempt
def delete_completed_projects(request):
    if request.method == 'DELETE':
        Projects.objects.filter(project_complete=True).delete()
        return JsonResponse({'success': True})
    

########################################################################################
# LOGIN AND SIGNUP FOR REACT
########################################################################################



from django.contrib.auth import authenticate, logout
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.authtoken.models import Token as AuthToken
from rest_framework.views import APIView
from .serializers import TaskSerializer, ContextSerializer, ProjectSerializer, AssigneeSerializer, CalendarSerializer
from django.contrib.auth.models import User
from rest_framework import status
from django.db import IntegrityError
from .serializers import UserSerializer
from rest_framework import generics
from .models import Calendar
import logging
import requests
# from google.auth.transport import requests
import os
from .models import UserToken
from rest_framework.authtoken.models import Token
from google.oauth2 import id_token
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from requests_oauthlib import OAuth2Session
from oauthlib.oauth2 import BackendApplicationClient
from googleapiclient.discovery import build
from datetime import datetime, timedelta
from django.utils import timezone
from django.utils.dateparse import parse_datetime
import pytz


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        token, created = AuthToken.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username})
    else:
        return Response({'error': 'Invalid login credentials'})
    

@api_view(['POST'])
def logout_view(request):
    if request.user.is_authenticated:
        # Django logout
        Token.objects.filter(user=request.user.id).delete()
        logout(request)

        return Response({"message": "Successfully logged out."}, status=200)
    else:
        print("user is not authenticated")
        return Response({"error": "You are not logged in."}, status=400)


class QuickTaskEntryViewAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        task_names = request.data.get('name', None)
        user_id = request.data.get('user', None)
        parent_id = request.data.get('parent', None)


        if not isinstance(task_names, list):
            task_names = [task_names]
            task_names = task_names[0].split("\n")   
        
        for task_name in task_names:
            if not task_name.strip():  # skip this iteration if task_name is empty or only contains spaces
                continue
            task_data = {'name': task_name, 'user': user_id, 'effort':0, 'parent': parent_id}
            serializer = TaskSerializer(data=task_data)
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=400)

        return Response({"message": "Tasks created successfully"}, status=201)


class NtoTaskView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            task = serializer.save(user=request.user)
            # print task and all its fields
            return Response({'task_id': task.id, 'task_name': task.name, 'parent': task.parent_id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        task = get_object_or_404(Tasks, pk=pk)
        serializer = TaskSerializer(task, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        task = get_object_or_404(Tasks, pk=pk)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class NtoProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)  # Removed Projects
        if serializer.is_valid():
            project = serializer.save(user=request.user)
            return Response({'project_id': project.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk=None):
        project = get_object_or_404(Projects, pk=pk)
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk=None):
        project = get_object_or_404(Projects, pk=pk)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    user = User.objects.get(username=request.user.username)
    return Response({'id': user.id, 'username': user.username})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tasks(request):                 # get all tasks for the new task organizer wizard and prioritizer
    tasks = Tasks.objects.filter(user=request.user)
    serializer = TaskSerializer(tasks, many=True)
    return JsonResponse(serializer.data, safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_new_tasks(request):                 # get all tasks for the new task organizer wizard and prioritizer
    tasks = Tasks.objects.filter(user=request.user, new_task=True)
    serializer = TaskSerializer(tasks, many=True)
    return JsonResponse(serializer.data, safe=False)

class ContextView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        contexts = Context.objects.filter(user=request.user)
        serializer = ContextSerializer(contexts, many=True)
        return JsonResponse(serializer.data, safe=False)

    def post(self, request):
        serializer = ContextSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        context = get_object_or_404(Context, pk=pk, user=request.user)
        serializer = ContextSerializer(context, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        context = get_object_or_404(Context, pk=pk, user=request.user)
        context.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AssigneeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        assignees = Assignee.objects.filter(user=request.user)
        serializer = AssigneeSerializer(assignees, many=True)
        return JsonResponse(serializer.data, safe=False)

    def post(self, request):
        serializer = AssigneeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        assignee = get_object_or_404(Assignee, pk=pk, user=request.user)
        serializer = AssigneeSerializer(assignee, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        assignee = get_object_or_404(Assignee, pk=pk, user=request.user)
        assignee.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CalendarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        calendars = Calendar.objects.filter(user=request.user)
        serializer = CalendarSerializer(calendars, many=True)
        return JsonResponse(serializer.data, safe=False)

    def post(self, request):
        serializer = CalendarSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        
        calendar = get_object_or_404(Calendar, pk=pk, user=request.user)
        serializer = CalendarSerializer(calendar, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    

    def delete(self, request, pk=None):
        try:
            calendar = get_object_or_404(Calendar, pk=pk, user=request.user)
            calendar.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logging.error(f"Error occurred: {e}")
            raise




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_projects(request):              # get all Projects for the new task organizer wizard and prioritizer
    projects = Projects.objects.filter(user=request.user, project_complete=False)
    serializer = ProjectSerializer(projects, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_task(request, task_id):    # delete a task on the new task organizer wizard
    try:
        task = Tasks.objects.get(id=task_id, user=request.user)
    except Tasks.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    try:
        task.delete()
    except IntegrityError as e:
        print("IntegrityError:", e)
        
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_204_NO_CONTENT)



@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def OAuth2CallbackView(request):
    code = request.GET.get('code')


    clientId = os.getenv('REACT_APP_CLIENT_ID')
    clientSecret = os.getenv('REACT_APP_CLIENT_SECRET')
    redirectUri = os.getenv('REACT_APP_REDIRECT_URI')
        

    data = {
        'code': code,
        'client_id': clientId,
        'client_secret': clientSecret,
        'redirect_uri': redirectUri,
        'grant_type': 'authorization_code',
    }

    response = requests.post('https://oauth2.googleapis.com/token', data=data)

    if response.status_code == 200:
        access_token = response.json()['access_token']
        refresh_token = response.json()['refresh_token']
        user_token, created = UserToken.objects.get_or_create(user=request.user)
        user_token.access_token = access_token
        user_token.refresh_token = refresh_token
        user_token.save()

        return JsonResponse({'message': 'Google Calendar linked successfully'})
    else:
        return JsonResponse({'error': 'Failed to exchange authorization code for tokens'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_token_view(request):
    user = request.user
    try:
        user_token = UserToken.objects.get(user=user)
    except UserToken.DoesNotExist:
        return Response({'error': 'UserToken does not exist for this user'}, status=404)
    except Exception as e:
        return Response({'error': 'An error occurred'}, status=500)

    return Response({'access_token': user_token.access_token, 'refresh_token': user_token.refresh_token})





class IsConnectedToGoogleApiView(View):
    def get(self, request, *args, **kwargs):
        user_id = request.GET.get('userId')
        user_token = UserToken.objects.get(user__id=user_id)
        


        try:
            # Verify the access token
            response = requests.get('https://www.googleapis.com/oauth2/v2/tokeninfo', params={'access_token': user_token.access_token})
            if response.status_code == 200:
                # If the access token is valid, return a positive response
                return JsonResponse({'is_connected': True})
            else:
                raise ValueError('Failed to verify token')

        except ValueError:
            # The access token is expired or invalid, try to refresh it
            client = BackendApplicationClient(client_id=os.getenv('REACT_APP_CLIENT_ID'))
            oauth = OAuth2Session(client=client)
            token = oauth.refresh_token(token_url="https://oauth2.googleapis.com/token", refresh_token=user_token.refresh_token, client_id=os.getenv('REACT_APP_CLIENT_ID'), client_secret=os.getenv('REACT_APP_CLIENT_SECRET'))

            # Update the tokens in the UserToken model
            user_token.access_token = token['access_token']
            user_token.refresh_token = token['refresh_token']
            user_token.save()

            # Return a positive response
            return JsonResponse({'is_connected': True})
        
        


class SyncGoogleCalendarView(View):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = request.GET.get('userId')
        user = User.objects.get(id=user_id)
        user_token = UserToken.objects.get(user__id=user_id)
                # Get the last Google Calendar sync timestamp
        last_gcal_sync_time_stamp = user_token.last_gCal_sync

        if last_gcal_sync_time_stamp is None:
            last_gcal_sync_time_stamp = timezone.make_aware(datetime(1980, 1, 1), timezone=pytz.UTC)
        

        # Load the user's credentials from the UserToken
        credentials = Credentials.from_authorized_user_info({
            'access_token': user_token.access_token,
            'refresh_token': user_token.refresh_token,
            'client_id': os.getenv('REACT_APP_CLIENT_ID'),
            'client_secret': os.getenv('REACT_APP_CLIENT_SECRET'),
            'token_uri': 'https://oauth2.googleapis.com/token',
        })

        # Build the Google Calendar service
        service = build('calendar', 'v3', credentials=credentials)

        # Fetch events from local Calendar
        local_events = Calendar.objects.filter(user=user)

        # Fetch events from Google Calendar
        now = datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
        two_weeks_ago = (datetime.utcnow() - timedelta(weeks=2)).isoformat() + 'Z'
        one_year_later = (datetime.utcnow() + timedelta(weeks=52)).isoformat() + 'Z'
        events_result = service.events().list(calendarId='primary', timeMin=two_weeks_ago, timeMax=one_year_later, singleEvents=True, orderBy='startTime').execute()
        gcal_events = events_result.get('items', [])

        # Create a list of Google Calendar event summaries
        gcal_event_summaries = [event['summary'] for event in gcal_events]



        # Iterate over Google Calendar events
        for gcal_event in gcal_events:
            gcal_updated = parse_datetime(gcal_event['updated'])

            if gcal_event['id'] not in [local_event.gcal_id for local_event in local_events]:
                if gcal_updated < last_gcal_sync_time_stamp:
                    # The event has been deleted in local calendar
                    service.events().delete(calendarId='primary', eventId=gcal_event['id']).execute()
                elif gcal_updated > last_gcal_sync_time_stamp:
                    # The event has been created in Google Calendar
                    if 'dateTime' in gcal_event['start']:
                        gcal_start = parse_datetime(gcal_event['start']['dateTime'])
                        gcal_end = parse_datetime(gcal_event['end']['dateTime'])
                        all_day = False
                    else:
                        gcal_start = parse_datetime(gcal_event['start']['date'] + 'T00:00:00Z')
                        gcal_end = parse_datetime(gcal_event['end']['date'] + 'T00:00:00Z')
                        all_day = True
                    new_event = Calendar(
                        user=user,
                        event_title=gcal_event['summary'],
                        event_start=gcal_start,
                        event_end=gcal_end,
                        event_allDay=all_day,
                        gcal_id=gcal_event['id'],  # Set the gcal_id to the Google Calendar event ID
                        last_sync=timezone.now()  # Set the last_sync to now
                    )

                    new_event.save()
                    
        # Iterate over local events
        for local_event in local_events:
            # Find the corresponding Google Calendar event
            corresponding_gcal_event = next((event for event in gcal_events if event['id'] == local_event.gcal_id), None)

            if local_event.gcal_id not in [event['id'] for event in gcal_events]:
                if local_event.last_sync is not None:
                    # The event has been deleted in Google Calendar
                    local_event.delete()
                elif local_event.last_sync is None:
                    # The event has been created in local calendar
                    if local_event.event_allDay:
                        start = {'date': (local_event.event_start + timedelta(days=1)).date().isoformat()} 
                        end = {'date': (local_event.event_end + timedelta(days=1)).date().isoformat()}  # Add one day to the end date
                    else:
                        start = {'dateTime': local_event.event_start.isoformat()}
                        end = {'dateTime': local_event.event_end.isoformat()}
                    gcal_event = service.events().insert(
                        calendarId='primary',
                        body={
                            'summary': local_event.event_title,
                            'start': start,
                            'end': end,
                            # Add other fields as necessary
                        },
                    ).execute()
                    local_event.gcal_id = gcal_event['id']  # Store the Google Calendar event ID
                    local_event.save()
                    
            elif corresponding_gcal_event and parse_datetime(corresponding_gcal_event['updated']) > local_event.last_updated:
                # The event has been updated in Google Calendar
                local_event.event_title = corresponding_gcal_event['summary']
                if 'dateTime' in corresponding_gcal_event['start']:
                    local_event.event_start = parse_datetime(corresponding_gcal_event['start']['dateTime'])
                    local_event.event_end = parse_datetime(corresponding_gcal_event['end']['dateTime'])
                    local_event.event_allDay = False
                else:
                    local_event.event_start = parse_datetime(corresponding_gcal_event['start']['date'] + 'T00:00:00Z')
                    local_event.event_end = parse_datetime(corresponding_gcal_event['end']['date'] + 'T00:00:00Z')
                    local_event.event_allDay = True
                local_event.last_updated = parse_datetime(corresponding_gcal_event['updated'])
                local_event.save()
            elif corresponding_gcal_event and parse_datetime(corresponding_gcal_event['updated']) < local_event.last_updated:
                # The event has been updated in local calendar
                if local_event.event_allDay:
                    start = {'date': (local_event.event_start + timedelta(days=1)).date().isoformat()} 
                    end = {'date': (local_event.event_end + timedelta(days=1)).date().isoformat()}  # Add one day to the end date
                else:
                    start = {'dateTime': local_event.event_start.isoformat()}
                    # If the event is no longer an all-day event, set the end time to be at least one hour after the start time
                    end_time = max(local_event.event_end, local_event.event_start + timedelta(hours=1))
                    end = {'dateTime': end_time.isoformat()}
                service.events().update(
                    calendarId='primary',
                    eventId=corresponding_gcal_event['id'],
                    body={
                        'summary': local_event.event_title,
                        'start': start,
                        'end': end,
                        # Add other fields as necessary
                    },
                ).execute()

        # record the last sync time
        user_token.last_gCal_sync = timezone.now()
        user_token.save()

        return JsonResponse({'status': 'success'})