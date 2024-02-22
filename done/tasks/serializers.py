from rest_framework import serializers
from .models import Tasks, Context, Projects, Assignee, Calendar
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
                'new_task',
                'compound_priority']
        

class ContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = Context
        fields = ['name', 'id', 'description', 'user']
        
class AssigneeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignee
        fields = ['name', 'id', 'description', 'user']
        
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

class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = ['user', 
                'event_title', 
                'event_start', 
                'event_end', 
                'event_allDay', 
                'event_taskId']
        
class UserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True, 'required': True},
            'password2': {'write_only': True, 'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"username": "Password fields didn't match."})
        if len(attrs['password']) < 8:
            raise serializers.ValidationError({"username": "Password is too short. It must contain at least 8 characters."})
        return attrs

    def create(self, validated_data):
        username = validated_data.get('username')
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "A user with this username already exists."})
        password = validated_data.pop('password', None)
        validated_data.pop('password2', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance