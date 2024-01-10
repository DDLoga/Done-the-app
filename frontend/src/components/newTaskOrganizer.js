import React, { useState, useEffect } from 'react';
import BaseLayout from './baseLayout';
import { TextField, RadioGroup, FormControlLabel, Radio, Button, Select, MenuItem } from '@mui/material';

const NewTaskOrganizer = () => {
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);
    const [taskType, setTaskType] = useState('');
    const [priority, setPriority] = useState('A');
    const [effort, setEffort] = useState('');
    const [deadline, setDeadline] = useState('');
    const [context, setContext] = useState('');
    const [relatedProject, setRelatedProject] = useState('');
    const [nextAction, setNextAction] = useState('');

    // collect tasks from API
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/get_tasks', {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        //print the data to the console
        //.then(data => console.log(data))
        .then(data => setTasks(data))
        .catch(error => console.error('Error:', error));
    }, []);

    useEffect(() => {
        if (tasks.length > 0) {
            setCurrentTask(tasks[0]);
        }
    }, [tasks]);

    const handleTaskTypeChange = (event) => {
        setTaskType(event.target.value);
    };

    const handlePriorityChange = (event) => {
        setPriority(event.target.value);
    };

    const handleEffortChange = (event) => {
        setEffort(event.target.value);
    };

    const handleDeadlineChange = (event) => {
        setDeadline(event.target.value);
    };

    const handleContextChange = (event) => {
        setContext(event.target.value);
    };

    const handleRelatedProjectChange = (event) => {
        setRelatedProject(event.target.value);
    };

    const handleNextActionChange = (event) => {
        setNextAction(event.target.value);
    };

    const handleProcessNext = () => {
        // Send POST request to API
    };

    const handleDelete = () => {
        if (currentTask) {
            fetch(`http://127.0.0.1:8000/api/tasks/${currentTask.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // Only try to parse the response as JSON if it's not empty
                return response.text().then(text => text ? JSON.parse(text) : {})
            })
            .then(() => {
                // Remove the deleted task from the tasks state
                setTasks(tasks.filter(task => task.id !== currentTask.id));
                // If there are any tasks left, set the current task to the first one
                // Otherwise, set the current task to null
                setCurrentTask(tasks.length > 1 ? tasks[0] : null);
            })
            .catch(error => console.error('Error:', error));
        }
    };

    return (
        <BaseLayout>
            <div>{tasks.length} remaining entries</div>
            <div>Current: {currentTask?.name}</div>
            {currentTask && <TextField value={currentTask.name} />}
            <RadioGroup value={taskType} onChange={handleTaskTypeChange}>
                <FormControlLabel value="task" control={<Radio />} label="A task" />
                <FormControlLabel value="project" control={<Radio />} label="A Project" />
                <FormControlLabel value="nonActionable" control={<Radio />} label="Non Actionable" />
            </RadioGroup>
            {taskType === 'task' && (
                <>
                    <Select value={priority} onChange={handlePriorityChange}>
                        <MenuItem value="A">A</MenuItem>
                        <MenuItem value="B">B</MenuItem>
                        <MenuItem value="C">C</MenuItem>
                        <MenuItem value="D">D</MenuItem>
                    </Select>
                    <TextField value={effort} onChange={handleEffortChange} />
                    <TextField type="date" value={deadline} onChange={handleDeadlineChange} />
                    <Select value={context} onChange={handleContextChange}>
                        {/* Populate with contexts from API */}
                    </Select>
                    <Select value={relatedProject} onChange={handleRelatedProjectChange}>
                        {/* Populate with projects from API */}
                    </Select>
                    <Button onClick={handleProcessNext}>Process & Next</Button>
                </>
            )}
            {taskType === 'project' && (
                <>
                    <Select value={priority} onChange={handlePriorityChange}>
                        <MenuItem value="A">A</MenuItem>
                        <MenuItem value="B">B</MenuItem>
                        <MenuItem value="C">C</MenuItem>
                        <MenuItem value="D">D</MenuItem>
                    </Select>
                    <TextField type="date" value={deadline} onChange={handleDeadlineChange} />
                    <TextField value={nextAction} onChange={handleNextActionChange} />
                    <Button onClick={handleProcessNext}>Process & Next</Button>
                </>
            )}
            {taskType === 'nonActionable' && (
                <Button onClick={handleDelete}>Delete</Button>
            )}
        </BaseLayout>
    );
};

export default NewTaskOrganizer;