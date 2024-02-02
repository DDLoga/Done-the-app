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
        path('get_contexts/', views.get_contexts, name='get_contexts'),
        path('get_assignees/', views.get_assignees, name='get_assignees'),
        path('get_projects/', views.get_projects, name='get_projects'),
        path('tasks/<int:task_id>/', views.delete_task, name='delete_task'),
    ])),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)