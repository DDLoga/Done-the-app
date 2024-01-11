import React, { useState, useEffect } from 'react';
import BaseLayout from './baseLayout';
import { TextField, RadioGroup, FormControlLabel, Radio, Button, Select, MenuItem } from '@mui/material';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

const NewTaskOrganizer = () => {
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);
    const [taskType, setTaskType] = useState('');
    const [priority, setPriority] = useState('A');
    const [effort, setEffort] = useState(0);
    //setting the default due date to today
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const [deadline, setDeadline] = useState(formattedDate);
    const [context, setContext] = useState(''); //used for the form
    const [contexts, setContexts] = useState([]); //used for the API to collect the list
    const [relatedProject, setRelatedProject] = useState('');
    const [projects, setProjects] = useState([]); //used for the API to collect the list
    const [nextAction, setNextAction] = useState('');
    const [filter, setFilter] = useState('');   //used for the filter of projects
    const filteredProjects = projects.filter(project =>
        project.project_name.toLowerCase().includes(filter.toLowerCase())
    );

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

    // collect contexts from API
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/get_contexts', {
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
        .then(data => setContexts(data))
        .catch(error => console.error('Error:', error));
    }, []);

    // collect projects from API
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/get_projects', {
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
        .then(data => setProjects(data))
        .catch(error => console.error('Error:', error));
    }, []);
    
    // set the current task to the first task in the list
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

    const handleRelatedProjectChange = (projectId) => {
        setRelatedProject(projectId);
    };

    const handleNextActionChange = (event) => {
        setNextAction(event.target.value);
    };

    const handleProcessNext = async () => {
        const userResponse = await fetch('http://127.0.0.1:8000/api/getUser/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        });
        const userData = await userResponse.json();
        const userId = userData.id;


        if (taskType === 'task') {
            fetch('http://127.0.0.1:8000/api/NtoTask/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: currentTask.name,
                    user: userId,
                    effort: effort,
                    id: currentTask.id,
                    priority: priority,
                    deadline: deadline,
                    context: context,
                    parent: relatedProject,
                    new_task: false,
                }),
            })
            //print the data to the console
            .then(response => response.json())
            .then(data => console.log(data))
            .then(() => {
                // Remove the deleted task from the tasks state
                setTasks(tasks.filter(task => task.id !== currentTask.id));
                // If there are any tasks left, set the current task to the first one
                // Otherwise, set the current task to null
                setCurrentTask(tasks.length > 1 ? tasks[0] : null);
                setTaskType([]);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        } else if (taskType === 'project') {
            // Send POST request for a project
        }
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
                setTaskType([]);
            })
            .catch(error => console.error('Error:', error));
        }
    };

    return (
        <BaseLayout>
            <div>{tasks.length} remaining entries</div>
            <div>Current: {currentTask?.name}</div>
            {currentTask && <TextField value={currentTask.name} onChange={e => setCurrentTask({...currentTask, name: e.target.value})} />}
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
                        {contexts.map((context) => (
                            <MenuItem key={context.id} value={context.id}>
                                {context.name}
                            </MenuItem>
                        ))}
                    </Select>

                    <div>
                        <TextField
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        label="Filter projects"
                        />

                        <List style={{ maxHeight: '200px', overflow: 'auto' }}>
                            {filteredProjects.map((project) => (
                                <ListItemButton
                                    key={project.id}
                                    selected={relatedProject === project.id}
                                    onClick={() => handleRelatedProjectChange(project.id)}
                                >
                                    <ListItemText primary={project.project_name} />
                                </ListItemButton>
                            ))}
                        </List>
                    </div>
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
                    <TextField value={nextAction} onChange={handleNextActionChange} placeholder="Enter the first actionable task for this project" />
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