from django.contrib import admin

# Register your models here.
from .models import Tasks, Calendar

admin.site.register(Tasks)
admin.site.register(Calendar)
