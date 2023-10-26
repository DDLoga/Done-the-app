from django.urls import path
from . import views

urlpatterns = [
    path('tasks/', views.index, name="index"),
    # path('new-task-organizer/', views.NewTaskOrganizer, name="NewTaskOrganizer"),
    path('new-task-organizer/submit-task/', views.NewTaskOrganizerSubmitTask, name="NewTaskOrganizerSubmitTask"),
    path('new-task-organizer/welcome/', views.NewTaskOrganizerWelcome, name="NewTaskOrganizerWelcome"),
    
    path('test/',views.test_form_view, name='test_page'),
]

# urlpatterns = [
#     path('myform/', views.my_form_view, name='my_form_view'),
#     path('success/', success_view, name='success_page'),  # Create a success page URL
# ]