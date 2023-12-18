from django.forms import ModelForm, Textarea
from .models import Tasks, Assignee, Context, Projects
from django import forms
from django.utils.translation import gettext_lazy as _

class DateInput(forms.DateInput):
    input_type = 'date'

class QuickTaskEntry(forms.ModelForm):
    class Meta:
        model=Tasks
        fields=['name']
        labels = {'name':_('')}
        widgets = {'name': Textarea(attrs={"cols": 80, "rows": 10}),}
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['name'].widget.attrs['placeholder'] = 'Enter your task list separated by enter'
        self.fields['name'].widget.attrs.update({'class': 'quick_task_entry_form_text w-input'})
        

class NewTaskOrganizerTaskForm(forms.ModelForm):
    class Meta:
        model = Tasks
        widgets = {'deadline' : DateInput(),'parent':forms.RadioSelect()}
        fields = ['priority', 'name', 'deadline', 'context', 'effort', 'parent', 'new_task']
    
    def __init__(self, *args, **kwargs):
        # super().__init__(*args, **kwargs)
        # self.fields['effort'].widget.attrs['placeholder'] = 'time'
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            self.fields['context'].queryset = Context.objects.filter(user=user)

class NewTaskOrganizerProjectForm(forms.ModelForm):
    class Meta:
        model = Projects
        widgets = {'project_deadline' : DateInput()}
        fields = ['project_priority', 'project_name', 'project_deadline']





#################### TESTS ############################
class TestForm(forms.ModelForm):
    class Meta:
        model = Tasks
        fields = ['priority', 'status', 'name', 'deadline', 'context', 'effort', 'assignee', 'parent']
        last_active = forms.DateField(widget=DateInput)
        
        
class Task_Form(forms.ModelForm):
    class Meta:
        model = Tasks
        fields = ['priority']