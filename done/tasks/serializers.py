from rest_framework import serializers
from .models import Tasks, Context, Projects

class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tasks
        fields = ['name', 'user', 'effort', 'id']

class ContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = Context
        fields = ['name', 'id']
        
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields = ['project_name', 'id']