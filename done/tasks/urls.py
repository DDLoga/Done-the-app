from django.urls import path
from . import views

urlpatterns = [
    path('tasks/', views.index, name="index"),
    # path('new-task-organizer/', views.NewTaskOrganizer, name="NewTaskOrganizer"),
    path('new-task-organizer/submit-task/', views.NewTaskOrganizerSubmitTask, name="NewTaskOrganizerSubmitTask"),
    path('new-task-organizer/', views.NewTaskOrganizerWelcome, name="NewTaskOrganizerWelcome"),
    path('new-task-organizer/delete-entry/', views.NewTaskOrganizerDelete, name="NewTaskOrganizerDelete"),
    path('new-task-organizer/submit-project/', views.NewTaskOrganizerSubmitProject, name="NewTaskOrganizerSubmitProject"),
    path('search/results/', views.project_filter_results_view, name='project_filter_results_view'),
    path('prioritizer/', views.Prioritizer, name="prioritizer"),
    
]