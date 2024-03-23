import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem } from '@mui/material';
import DatePicker from './_DatePicker';
import PrioritySelect from './_PrioritySelect';
import { updateTaskAPI } from './_fetchTasks';
import { useQuery, useMutation } from 'react-query';
import { fetchProjectsAPI } from './_fetchProjects';
import { fetchWithToken } from './_api';

const TaskPropertiesDialog = ({ open, onClose, task, onSave }) => {
    const [name, setName] = useState(task ? task.name : '');                                    // Task attributes declaration
    const [deadline, setDeadline] = useState(task && task.deadline ? task.deadline : '');
    const [priority, setPriority] = useState(task ? task.priority : '');
    const [status, setStatus] = useState(task && task.status ? task.status : '');
    const [parent, setParent] = useState(task ? task.parent : '');
    let deadlineDate = new Date(deadline);                                                      // transform the deadline to a Date object
    let formattedDeadline = deadlineDate instanceof Date && !isNaN(deadlineDate)
        ? `${deadlineDate.getFullYear()}-${("0" + (deadlineDate.getMonth() + 1)).slice(-2)}-${("0" + deadlineDate.getDate()).slice(-2)}`
        : '';

    const {                                                                                     // Fetch projects data to convert parent id to project name                                            
        data: projectsData,
    } = useQuery('fetchProjects', fetchProjectsAPI);

    const getProjectName = (parentId) => {
        if (!parentId || !projectsData) {
            return "No parent project";
        }
        const project = projectsData.find((project) => project.id === parentId);
        return project ? project.project_name : "No parent project";
    };

    useEffect(() => {                                                                           // Update task properties when task changes
        if (task) {
            setName(task.name ? task.name : '');
            setDeadline(task.deadline ? task.deadline : '');
            setPriority(task.priority ? task.priority : '');
            setParent(task.parent ? task.parent : '');
            setStatus(task.status ? task.status : '');
        }
    }, [task]);

    const updateTaskMutation = useMutation(updateTaskAPI, {                                     // Update task on backend
        onSuccess: (data) => {
            const updatedTask = { ...task, name, deadline, priority, parent, status };
            onSave(updatedTask);
        },
    });

    const handleSave = async () => {                                                            // on save button click
        const userResponse = await fetchWithToken(                                              // Get user id
            `${process.env.REACT_APP_API_URL}/getUser/`,
            { method: 'GET' });
        const userData = await userResponse.json();                                             
        const userId = userData.id;                                                             // Get user id
        const deadlineDate = new Date(deadline);                                                // Convert deadline to 'YYYY-MM-DD' format
        const formattedDeadline = `${deadlineDate.getFullYear()}-${String(deadlineDate.getMonth() + 1).padStart(2, '0')}-${String(deadlineDate.getDate()).padStart(2, '0')}`;
        const updatedTask = {
            name: name,
            priority: priority,
            status: status,
            deadline: formattedDeadline,
            user: userId,
        };
        updateTaskMutation.mutate({ taskId: task.id, updatedTask});
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
                        setDeadline(selectedDate);
                    }} 
                    fullWidth 
                />
                <PrioritySelect 
                    label="Priority" 
                    value={priority} 
                    onChange={e => setPriority(e.target.value)} 
                />
                <Select
                    label="Status" 
                    value={status || ''}
                    onChange={e => setStatus(e.target.value)} 
                    
                >
                    <MenuItem value="Co">Completed</MenuItem>
                    <MenuItem value="Cn">Cancelled</MenuItem>
                    <MenuItem value="De">Delegated</MenuItem>
                    <MenuItem value="Ip">In Process</MenuItem>
                    <MenuItem value="Ns">Not Started</MenuItem>
                    <MenuItem value="Wa">Wait for</MenuItem>
                </Select>
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