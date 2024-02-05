from rest_framework import serializers
from .models import Tasks, Context, Projects, Assignee
from django.contrib.auth.models import User
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tasks
        fields = ['name', 
                'user', 
                'effort', 
                'id',
                'priority',
                'deadline',
                'context',
                'effort',
                'parent',
                'new_task',
                'assignee',
                'status',
                'complete',
                'new_task']
        

class ContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = Context
        fields = ['name', 'id']
        
class AssigneeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignee
        fields = ['name', 'id']
        
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields = ['project_name',
                'id',
                'project_priority',
                'user',
                'project_deadline',
                'project_status',
                'project_complete']
        
        
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True, 'required': True}}

    def create(self, validated_data):
        username = validated_data.get('username')
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "A user with this username already exists."})
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance