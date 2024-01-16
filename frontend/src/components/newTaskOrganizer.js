import React, { useState, useEffect } from 'react';
import BaseLayout from './baseLayout';
import { TextField, RadioGroup, FormControlLabel, Radio, Button, Select, MenuItem } from '@mui/material';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

const NewTaskOrganizer = () => {
    const headerContent = "New Task Organizer Wizard";
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);
    const [taskType, setTaskType] = useState('');
    const [priority, setPriority] = useState('A');
    const [effort, setEffort] = useState(0);
    const today = new Date();                       //setting the default due date to today
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const [deadline, setDeadline] = useState(formattedDate);
    const [context, setContext] = useState('');     //used for the form
    const [contexts, setContexts] = useState([]);   //used for the API to collect the list
    const [relatedProject, setRelatedProject] = useState('');
    const [projects, setProjects] = useState([]);   //used for the API to collect the list
    const [nextAction, setNextAction] = useState('');
    const [filter, setFilter] = useState('');       //used for the filter of projects
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
    const fetchProjects = () => {
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
    };
    
    useEffect(() => {
        fetchProjects();
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

    const fetchWithToken = (url, options) => fetch(url, {
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    const handleResponse = () => {
        setTasks(tasks.filter(task => task.id !== currentTask.id));
        setCurrentTask(tasks.length > 1 ? tasks[0] : null);
        setTaskType([]);
        setNextAction([])
        if (taskType !== 'task') {
            handleDelete();
        }
    }

    const handleProcessNext = async () => {
        const userResponse = await fetchWithToken('http://127.0.0.1:8000/api/getUser/', { method: 'GET' });
        const userData = await userResponse.json();
        const userId = userData.id;

        const url = taskType === 'task' ? 'http://127.0.0.1:8000/api/NtoTask/' : 'http://127.0.0.1:8000/api/NtoProject/';
        const body = taskType === 'task' ? {
            name: currentTask.name,
            user: userId,
            effort: effort,
            id: currentTask.id,
            priority: priority,
            deadline: deadline,
            context: context,
            parent: relatedProject,
            new_task: false,
        } : {
            project_name: currentTask.name,
            user: userId,
            project_priority: priority,
            project_deadline: deadline,
        };

        fetchWithToken(url, { method: 'POST', body: JSON.stringify(body) })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (taskType === 'project' && nextAction !== '') {
                    fetchWithToken('http://127.0.0.1:8000/api/quickTask/', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: nextAction,
                            user: userId,
                            parent: data.project_id,
                        }),
                    })
                    .then(response => response.json())
                    .then(data => console.log(data))
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                }
            })
            .then(handleResponse)
            .catch((error) => {
                console.error('Error:', error);
            });
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

    const commonStyles = {
        '& .MuiOutlinedInput-root': {
        color: '#FFFFFF',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#9699A6',
            borderWidth: '2px',
        },
        },
        '& label': {
        color: '#9699A6',
        },
        '& .MuiOutlinedInput-notchedOutline' : {
        borderColor: '#9699A6',
        },
    };


    return (
    <BaseLayout headerContent={headerContent}>
        <div className="flex flex-col text-white p-6">
            <div>
                <div className="flex justify-between max-w-screen-lg mx-auto">
                    <div>
                        <h1 className="text-2xl mb-4" style={{ color: '#579BFC' }}>{tasks.length} remaining entries</h1>
                        <h2 className="text-lg mb-4">Current: {currentTask?.name}</h2>
                        {currentTask && (
                        <TextField
                            className="form-input mt-1 block w-full"
                            label="Rename your task"
                            value={currentTask.name}
                            sx={commonStyles}
                        />
                )}
                    </div>
                    <div>
                        <h2 className="text-lg mb-4" style={{ color: '#579BFC' }}>What is this?</h2>
                        <RadioGroup
                            className="flex flex-row my-4 items-left"
                            value={taskType}
                            onChange={handleTaskTypeChange}
                        >
                            <FormControlLabel 
                                value="task" 
                                control={<Radio color="default" sx={{ color: 'grey', '&.Mui-checked': { color: '#579BFC' } }} />} 
                                label="A task" 
                                className="flex items-center"
                            />
                            <FormControlLabel
                                value="project"
                                control={<Radio color="default" sx={{ color: 'grey', '&.Mui-checked': { color: '#579BFC' } }} />} 
                                label="A Project"
                                className="flex items-center"
                            />
                            <FormControlLabel
                                value="nonActionable"
                                control={<Radio color="default" sx={{ color: 'grey', '&.Mui-checked': { color: '#579BFC' } }} />} 
                                label="Non Actionable"
                                className="flex items-center"
                            />
                        </RadioGroup>
                    </div>
                </div>
                

        
            </div>

        {taskType === "task" && (
            <>
            <Select 
                value={priority} 
                onChange={handlePriorityChange}
                sx={{ '& .MuiSelect-select': {
                    color: '#FFFFFF',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#9699A6', // red color on hover
                    },
                }}
                >
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
                <MenuItem value="D">D</MenuItem>
            </Select>
            <TextField 
                value={effort} 
                onChange={handleEffortChange}
                sx={commonStyles}
            />
            <TextField
                type="date"
                value={deadline}
                onChange={handleDeadlineChange}
                sx={{ 
                    '& .MuiOutlinedInput-root': {       //this is the class for the input field
                        color: '#FFFFFF',            //this is the color of the text
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#9699A6', // red color on hover
                            borderWidth: '2px', // increased border thickness
                        },
                    },
                    '& label': {
                        color: '#9699A6',         //this is the color of the label
                    },
                    '& .MuiOutlinedInput-notchedOutline' : {
                        borderColor: '#9699A6',     //this is the color of the border
                    },
                }}
            />
            <Select 
                value={context} 
                onChange={handleContextChange}
                sx={{ '& .MuiSelect-select': {
                    color: '#FFFFFF',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#9699A6', // red color on hover
                    },
                }}
                >
                {contexts.map((context) => (
                <MenuItem key={context.id} value={context.id}>
                    {context.name}
                </MenuItem>
                ))}
            </Select>

            <div>
                <TextField
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                label="Filter projects"
                sx={commonStyles}
                />

                <List style={{ maxHeight: "200px", overflow: "auto" }}>
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
        {taskType === "project" && (
            <>
            <Select value={priority} onChange={handlePriorityChange}>
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
                <MenuItem value="D">D</MenuItem>
            </Select>
            <TextField
                type="date"
                value={deadline}
                onChange={handleDeadlineChange}
            />
            <TextField
                value={nextAction}
                onChange={handleNextActionChange}
                placeholder="Enter the first actionable task for this project"
            />
            <Button onClick={handleProcessNext}>Process & Next</Button>
            </>
        )}
        {taskType === "nonActionable" && (
            <Button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleDelete}
            >
            Delete
            </Button>
        )}
        </div>
    </BaseLayout>
    );
};

export default NewTaskOrganizer;