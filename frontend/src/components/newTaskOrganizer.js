import React, { useState, useEffect } from 'react';
import BaseLayout from './baseLayout';
import { TextField, RadioGroup, FormControlLabel, Radio, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import PrioritySelect from './_PrioritySelect';  //importing the priority select component (refactor)
import DatePicker from './_DatePicker';          //importing the date picker component (refactor)
import { commonStyles } from './_commonStyles';
import { useFetchProjects } from './_fetchProjects';        // collect projects from API
import { useFetchTasks } from './_fetchTasks';              // collect tasks from API
import { FetchContexts } from './_fetchContexts';        // collect contexts from API




const NewTaskOrganizer = () => {
    const headerContent = "New Task Organizer Wizard";
    const [currentTask, setCurrentTask] = useState(null);
    const [taskType, setTaskType] = useState('');
    const [priority, setPriority] = useState('A');
    const [effort, setEffort] = useState(0);
    const today = new Date();                       //setting the default due date to today
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const [deadline, setDeadline] = useState(formattedDate);
    const [context, setContext] = useState('');     //used for the form
    const fetchedContexts = FetchContexts();     // using the custom hook to fetch the contexts from the API
    const [contexts, setContexts] = useState([]);   //used for the API to collect the list
    const [relatedProject, setRelatedProject] = useState('');
    const [nextAction, setNextAction] = useState('');
    const [filter, setFilter] = useState('');       //used for the filter of projects
    const fetchedTasks = useFetchTasks();           // using the custom hook to fetch the tasks from the API
    const [tasks, setTasks] = useState([]);
    const projects = useFetchProjects();            //using the custom hook to fetch the projects from the API
    const filteredProjects = projects.filter(project =>
        project.project_name.toLowerCase().includes(filter.toLowerCase())
    );


    // initialize contexts with the fetched contexts
    useEffect(() => {
        setContexts(fetchedContexts);
    }, [fetchedContexts]);


    // initialize tasks with the fetched tasks
    useEffect(() => {
        setTasks(fetchedTasks);
    }, [fetchedTasks]);


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




    return (
        <BaseLayout headerContent={headerContent}>
            <div className="flex flex-col text-white p-6 space-y-4">
                <div>
                    <div className="flex flex-col sm:flex-row justify-between mx-auto space-y-4 max-w-screen-sm">
                        <div>
                            <h1 className="text-2xl mb-4" style={{ color: "#579BFC" }}>
                            {tasks.length} remaining entries
                            </h1>
                            <h2 className="text-lg mb-4">Current: {currentTask?.name}</h2>
                            {currentTask && (
                            <TextField
                                className="form-input mt-1 block w-full"
                                label="Rename your task"
                                value={currentTask.name}
                                sx={commonStyles}
                                onChange={(e) =>
                                setCurrentTask({ ...currentTask, name: e.target.value })
                                }
                            />
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg mb-4" style={{ color: "#579BFC" }}>
                            What is this?
                            </h2>
                            <RadioGroup
                            className="flex flex-row my-4 items-left"
                            value={taskType}
                            onChange={handleTaskTypeChange}
                            >
                            <FormControlLabel
                                value="task"
                                control={
                                <Radio
                                    color="default"
                                    sx={{
                                    color: "grey",
                                    "&.Mui-checked": { color: "#579BFC" },
                                    }}
                                />
                                }
                                label="A task"
                                className="flex items-center"
                            />
                            <FormControlLabel
                                value="project"
                                control={
                                <Radio
                                    color="default"
                                    sx={{
                                    color: "grey",
                                    "&.Mui-checked": { color: "#579BFC" },
                                    }}
                                />
                                }
                                label="A Project"
                                className="flex items-center"
                            />
                            <FormControlLabel
                                value="nonActionable"
                                control={
                                <Radio
                                    color="default"
                                    sx={{
                                    color: "grey",
                                    "&.Mui-checked": { color: "#579BFC" },
                                    }}
                                />
                                }
                                label="Non Actionable"
                                className="flex items-center"
                            />
                            </RadioGroup>
                        </div>
                    </div>
                </div>

            
                {taskType === "task" && (
                    <>
                    <div className="flex flex-col sm:flex-row justify-between max-w-screen-lg mx-auto space-y-4">
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-row space-x-4">
                                <PrioritySelect value={priority} onChange={handlePriorityChange} />
                                <DatePicker value={deadline} onChange={handleDeadlineChange} />
    
                            </div>
                            <div className="flex flex-row space-x-4">                        
                                <TextField
                                    value={effort}
                                    label="Effort (min)"
                                    onChange={handleEffortChange}
                                    sx={{ ...commonStyles, maxWidth: 100 }}
                                />

                                <FormControl variant="outlined" sx={{ ...commonStyles, minWidth: 180 }}>
                                    <InputLabel id="context-label">Context</InputLabel>
                                    <Select
                                    label="Context"
                                    value={context}
                                    onChange={handleContextChange}
                                    input={<OutlinedInput label="Context" />}
                                    >
                                    {contexts.map((context) => (
                                        <MenuItem key={context.id} value={context.id}>
                                        {context.name}
                                        </MenuItem>
                                    ))}
                                    </Select>
                                </FormControl>
                            </div>
                            <div className="flex flex-col space-y-4">
                                <TextField
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    label="Filter projects"
                                    sx={commonStyles}
                                />

                                <List
                                    sx={{
                                        maxHeight: "200px",
                                        overflow: "auto",
                                        border: "1px solid #9699A6",
                                        borderRadius: "4px",
                                    }}
                                    >
                                    {filteredProjects.map((project) => (
                                        <ListItemButton
                                        key={project.id}
                                        selected={relatedProject === project.id}
                                        onClick={() => handleRelatedProjectChange(project.id)}
                                        sx={{
                                            "&:hover": {
                                            backgroundColor: "#18283b", // replace with your color
                                            },
                                        }}
                                        >
                                        <ListItemText primary={project.project_name} />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </div>
                        </div>
                    </div>
                        <Button onClick={handleProcessNext}>Process & Next</Button>
                    </>
                )}
            

            {taskType === "project" && (
                <div className="flex flex-col sm:flex-row justify-between max-w-screen-lg mx-auto space-y-4">
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-row space-x-4">
                            <PrioritySelect value={priority} onChange={handlePriorityChange} />
                            <DatePicker value={deadline} onChange={handleDeadlineChange} />
                        </div>
                    <TextField
                        value={nextAction}
                        label="First Action"
                        onChange={handleNextActionChange}
                        sx={{ ...commonStyles, minWidth: 100 }}
                    />
                    <Button onClick={handleProcessNext}>Process & Next</Button>
                    </div>
                </div>
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