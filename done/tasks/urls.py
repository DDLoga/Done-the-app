from django.urls import path
from . import views
from .views import CompoundPriorityView

urlpatterns = [
    path('', views.home, name='home'),
    path('sorry/', views.sorry, name='sorry'),
    path('QuickTaskEntry/', views.QuickTaskEntryView, name="QuickTaskEntry"),
    path('new-task-organizer/submit-task/', views.NewTaskOrganizerSubmitTask, name="NewTaskOrganizerSubmitTask"),
    path('new-task-organizer/', views.NewTaskOrganizerWelcome, name="NewTaskOrganizerWelcome"),
    path('new-task-organizer/delete-entry/', views.NewTaskOrganizerDelete, name="NewTaskOrganizerDelete"),
    path('new-task-organizer/submit-project/', views.NewTaskOrganizerSubmitProject, name="NewTaskOrganizerSubmitProject"),
    path('search/results/', views.project_filter_results_view, name='project_filter_results_view'),
    path('prioritizer/', views.Prioritizer, name="prioritizer"),
    path('save_tasks/', views.save_tasks, name='save_tasks'),
    path('save_projects/', views.save_projects, name='save_projects'),
    path('compound_priority/', CompoundPriorityView.as_view(), name='compound_priority'),
    path('api/tasks/', views.api_tasks_compound_priorities, name='api_tasks'),
    path('delete-completed-tasks/', views.delete_completed_tasks, name='delete_completed_tasks'),
    path('delete-completed-projects/', views.delete_completed_projects, name='delete_completed_projects'),
    path('contexts/', views.contexts, name='contexts'),
    path('update_context/', views.update_context, name='update_context'),
    path('add_context/', views.add_context, name='add_context'),
    path('delete_context/', views.delete_context, name='delete_context'),
    path('assignees/', views.assignees, name='assignees'),
    path('update_assignee/', views.update_assignee, name='update_assignee'),
    path('add_assignee/', views.add_assignee, name='add_assignee'),
    path('delete_assignee/', views.delete_assignee, name='delete_assignee'),
    path('table_task/', views.table_task, name='table_task'),
    path('table_project/', views.table_project, name='table_project'),
]