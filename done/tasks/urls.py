from django.urls import path
from . import views
from .views import CompoundPriorityView

urlpatterns = [
    path('', views.home, name='home'),
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
]