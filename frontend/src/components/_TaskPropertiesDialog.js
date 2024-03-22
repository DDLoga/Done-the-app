import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import DatePicker from './_DatePicker';
import PrioritySelect from './_PrioritySelect';
import { useQuery } from 'react-query';
import { fetchProjectsAPI } from './_fetchProjects';

const TaskPropertiesDialog = ({ open, onClose, task, onSave }) => {
    const [name, setName] = useState(task ? task.name : '');
    const [deadline, setDeadline] = useState(task && task.deadline ? task.deadline : '');
    const [priority, setPriority] = useState(task ? task.priority : '');
    const [parent, setParent] = useState(task ? task.parent : '');
    console.log(task)
    console.log('task name: ', name)
    console.log('due date: ', deadline)
    console.log('Priority: ', priority)
    console.log('Parent: ', parent)
    let deadlineDate = new Date(deadline);
    let formattedDeadline = deadlineDate instanceof Date && !isNaN(deadlineDate)
        ? `${deadlineDate.getFullYear()}-${("0" + (deadlineDate.getMonth() + 1)).slice(-2)}-${("0" + deadlineDate.getDate()).slice(-2)}`
        : '';

    const { 
        data: projectsData,
    } = useQuery('fetchProjects', fetchProjectsAPI);

    const getProjectName = (parentId) => {
        if (!parentId || !projectsData) {
            return "No parent project";
        }
        const project = projectsData.find((project) => project.id === parentId);
        return project ? project.project_name : "No parent project";
    };

    useEffect(() => {
        if (task) {
            setName(task.name ? task.name : '');
            setDeadline(task.deadline ? task.deadline : '');
            setPriority(task.priority ? task.priority : '');
            setParent(task.parent ? task.parent : '');
        }
    }, [task]);

    const handleSave = () => {
        onSave({ ...task, name, deadline, priority, parent });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle className="mb-4">Edit Task</DialogTitle>
            <DialogContent className="space-y-4" style={{ paddingTop: '2.5rem' }}>
                <TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth />
                <DatePicker 
                    label="Due Date" 
                    value={formattedDeadline} 
                    onChange={(event) => {
                        const selectedDate = new Date(event.target.value);
                        console.log('Selected date: ', selectedDate);
                        setDeadline(selectedDate);
                    }} 
                    fullWidth 
                />
                <PrioritySelect 
                    label="Priority" 
                    value={priority} 
                    onChange={e => setPriority(e.target.value)} 
                    style={{ minWidth: '600px' }}
                />
                <TextField 
                    label="Parent" 
                    value={getProjectName(parent)} 
                    fullWidth 
                    disabled 
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskPropertiesDialog;