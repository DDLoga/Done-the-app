from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView
from tasks import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    # path('', TemplateView.as_view(template_name='index.html')),
    path('', include('tasks.urls')),
    path('api/', include([
        path('register/', views.CreateUserView.as_view(), name='register'),
        path('login/', views.login, name='login'),
        path('logout/', views.logout_view, name='logout'),
        path('quickTask/', views.QuickTaskEntryViewAPI.as_view(), name='quickTask'),
        path('NtoTask/', views.NtoTaskView.as_view(), name='NtoTask'),
        path('NtoTask/<int:pk>/', views.NtoTaskView.as_view(), name='task-detail'),
        path('NtoProject/', views.NtoProjectView.as_view(), name='NtoProject'),
        path('NtoProject/<int:pk>/', views.NtoProjectView.as_view(), name='project-detail'),
        path('getUser/', views.get_user, name='get_user'),
        path('get_tasks/', views.get_tasks, name='get_tasks'),
        path('get_new_tasks/', views.get_new_tasks, name='get_new_tasks'),
        path('get_contexts/', views.ContextView.as_view(), name='get_contexts'),
        path('get_contexts/<int:pk>/', views.ContextView.as_view(), name='ger_contexts_detail'),
        path('get_assignees/', views.AssigneeView.as_view(), name='get_assignees'),
        path('get_assignee/<int:pk>/', views.AssigneeView.as_view(), name='ger_assignees_detail'),
        path('get_calendars/', views.CalendarView.as_view(), name='get_calendars'),
        path('get_calendar/<int:pk>/', views.CalendarView.as_view(), name='get_calendar_detail'),
        path('get_projects/', views.get_projects, name='get_projects'),
        path('tasks/<int:task_id>/', views.delete_task, name='delete_task'),
        path('oauth2callback/', views.OAuth2CallbackView, name='oauth2callback'),
        path('user-token/', views.user_token_view, name='user-token'),
        path('IsConnectedToGoogleApiView/', views.IsConnectedToGoogleApiView.as_view(), name='IsConnectedToGoogleApiView'),
        path('sync-google-calendar/', views.SyncGoogleCalendarView.as_view(), name='sync-google-calendar'),
        path('unlink-google-calendar/', views.UnlinkView, name='unlink-google-calendar'),
    ])),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)