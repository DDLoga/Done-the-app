import React, { useState, useEffect } from 'react';
import BaseLayout from './baselayout';
import { TextField, RadioGroup, FormControlLabel, Radio, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import PrioritySelect from './_PrioritySelect';  //importing the priority select component (refactor)
import DatePicker from './_DatePicker';          //importing the date picker component (refactor)
import { commonStyles } from './_commonStyles';
import { fetchWithToken } from './_api';
import { Slider, Box } from '@mui/material';
import { useMutation } from 'react-query';
import { createContext} from './_fetchContexts';
import { Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';

const NewTaskOrganizer = () => {

    const headerContent = "New Task Organizer Wizard";

    const [tasksList, setTasksList] = useState([]);                         //array of tasks fetched by the API
    const [currentTask, setCurrentTask] = useState(null);           //current task to be processed
    const [taskType, setTaskType] = useState('');                   //used to selects task/project/nonActionable
    const [priority, setPriority] = useState('A');                  //used as default priority
    const [effort, setEffort] = useState(0);                        //used as default effort
    const today = new Date();                                       //setting the default due date to today
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const [deadline, setDeadline] = useState(formattedDate);        //used as default deadline
    const [context, setContext] = useState('');                     //the selected context for the task
    const [contexts, setContexts] = useState([]);                   //list of contexts fetched by the API
    const [relatedProject, setRelatedProject] = useState('');       //the selected project for the task
    const [projects, setProjects] = useState([]);                   //list of projects fetched by the API
    const [nextAction, setNextAction] = useState('');               //the next action for the project
    const [filter, setFilter] = useState('');                       //used for the filter of projects
    const filteredProjects = projects.filter(project =>             //filtering the projects
        project.project_name.toLowerCase().includes(filter.toLowerCase())
    );
    const [newContextDialogOpen, setNewContextDialogOpen] = useState(false);    //used to open the dialog for the new context
    const [newContextName, setNewContextName] = useState("");                   //used to set the new context name
    const [newContextDescription, setNewContextDescription] = useState("");     //used to set the new context description
    
    useEffect(() => {                                               //fetching the tasks from the API                                               
        fetch(`${process.env.REACT_APP_API_URL}/get_new_tasks`, {
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
        .then(data => setTasksList(data))

        .catch(error => console.error('Error:', error));
    }, []);

    useEffect(() => {                                               //fetching the contexts from the API
        fetch(`${process.env.REACT_APP_API_URL}/get_contexts`, {
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

    const fetchProjects = () => {                                   //fetching the projects from the API
        fetch(`${process.env.REACT_APP_API_URL}/get_projects`, {
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
    
    useEffect(() => {                                               //loading the projects into an array at page load
        fetchProjects();
    }, []);

    useEffect(() => {                                               //pick the first task from the list
        if (tasksList.length > 0) {
            setCurrentTask(tasksList[0]);
        }
    }, [tasksList]);



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




    const handleApiResponse = () => {
        setTasksList(tasksList.filter(task => task.id !== currentTask.id));
        setCurrentTask(tasksList.length > 1 ? tasksList[0] : null);
        setTaskType([]);
        setNextAction([])
        setContext('')
        setDeadline(formattedDate)
        if (taskType !== 'task') {
            handleDelete();
        }
    }

    const handleProcessNext = async () => {
        const userResponse = await fetchWithToken(`${process.env.REACT_APP_API_URL}/getUser/`, { method: 'GET' });
        const userData = await userResponse.json();
        const userId = userData.id;

        const url = taskType === 'task' ? `${process.env.REACT_APP_API_URL}/NtoTask/` : `${process.env.REACT_APP_API_URL}/NtoProject/`;
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
            project_status: 'Ns',
        };

        fetchWithToken(url, { method: 'POST', body: JSON.stringify(body) })
            .then(response => response.json())
            .then(data => {
                if (taskType === 'project' && nextAction !== '') {
                    fetchWithToken(`${process.env.REACT_APP_API_URL}/quickTask/`, {
                        method: 'POST',
                        body: JSON.stringify({
                            name: nextAction,
                            user: userId,
                            new_task: false,
                            parent: data.project_id,
                        }),
                    })
                    .then(response => response.json())
                    .then(() => {
                        if (taskType === 'project') {
                            fetch(`${process.env.REACT_APP_API_URL}/get_projects`, {
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
                            .then(data => setProjects(data))
                            .catch(error => console.error('Error:', error));
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                } else if (taskType === 'task') {
                    handleDelete();
                }
            })
            .then(handleApiResponse)
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const handleDelete = () => {
        if (currentTask) {
            fetch(`${process.env.REACT_APP_API_URL}/tasks/${currentTask.id}`, {
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
                setTasksList(tasksList.filter(task => task.id !== currentTask.id));
                // If there are any tasks left, set the current task to the first one
                // Otherwise, set the current task to null
                setCurrentTask(tasksList.length > 1 ? tasksList[0] : null);
                setTaskType([]);
            })
            .catch(error => console.error('Error:', error));
        }
    };



    const handleAddContext = () => {
        setNewContextDialogOpen(true);
    };

    const handleClose = () => {
        setNewContextDialogOpen(false);
    };

    const createContextMutation = useMutation(createContext, {
        onSuccess: async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/get_contexts`, {
                    headers: {
                        'Authorization': `Token ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setContexts(data);
                setContext(data[data.length - 1].id); // set the last context
                setNewContextName("");
                setNewContextDescription("");
            } catch (error) {
                console.error('Error:', error);
            }
        },
    });

    const handleSubmit = async () => {
        const userResponse = await fetchWithToken(`${process.env.REACT_APP_API_URL}/getUser/`, { method: 'GET' });
        const userData = await userResponse.json();
        const userId = userData.id;
        const newContext = {
            name: newContextName,
            description: newContextDescription,
            user: userId,
        };
        createContextMutation.mutate(newContext);
        setNewContextDialogOpen(false);
    };


    return (
        <BaseLayout headerContent={headerContent}>
                {tasksList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white px-4 sm:px-0">
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-8">
                            <span className="text-yellow-300">No new entries to be processed.</span>
                        </h1>
                        <h2 className="text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-8 text-center">
                            You can now review your projects, tasks or schedule.
                        </h2>
                    </div>
                ) : (
            <div className="flex flex-col text-white p-6 space-y-4 ">
                <div>
                <div className="flex flex-col sm:flex-row justify-center mx-auto space-y-4 sm:space-y-6 space-x-0 sm:space-x-12 max-w-screen-sm">
                        <div className="flex flex-col space-y-4 w-full sm:w-auto">
                            <h1 className="text-2xl mb-4" style={{ color: "#579BFC" }}>
                            {tasksList.length} remaining entries
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
                        <div className="flex flex-col space-y-4 w-full sm:w-auto">
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
                    <div className="flex flex-col sm:flex-row justify-between mx-auto space-y-4 sm:space-y-0 space-x-0 sm:space-x-6 max-w-screen-sm">
                        <div className="flex flex-col space-y-4 w-full sm:w-auto">
                            <TextField
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                label="Find a related project"
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
                        <div className="flex flex-col space-y-4 w-full sm:w-auto">
                            <div className="flex flex-col space-y-4">
                                <PrioritySelect value={priority} onChange={handlePriorityChange} />
                                <DatePicker value={deadline} onChange={handleDeadlineChange} />
                            </div>
                            <div className="flex flex-col space-y-4">                        
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
                                        <MenuItem onClick={handleAddContext}>+ add context</MenuItem>
                                    </Select>
                                    <Dialog open={newContextDialogOpen} onClose={handleClose}>
                                    <DialogContent>
                                        <DialogContentText id="alert-dialog-description">
                                            Please enter the name and description for the new context.
                                        </DialogContentText>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            label="Name"
                                            type="text"
                                            fullWidth
                                            value={newContextName}
                                            onChange={(e) => setNewContextName(e.target.value || "")}
                                        />
                                        <TextField
                                            margin="dense"
                                            label="Description"
                                            type="text"
                                            fullWidth
                                            value={newContextDescription}
                                            onChange={(e) => setNewContextDescription(e.target.value || "")}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleClose}>Cancel</Button>
                                        <Button onClick={handleSubmit} autoFocus>
                                            Add
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                                </FormControl>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...commonStyles, maxWidth: '100%' }}>
                                    <TextField
                                        value={effort}
                                        label="Effort (min)"
                                        onChange={handleEffortChange}
                                        fullWidth
                                    />
                                    <Slider
                                        value={effort}
                                        min={0}
                                        max={60}
                                        step={5}
                                        onChange={handleEffortChange}
                                        valueLabelDisplay="auto"
                                    />
                                </Box>
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
            )}
        </BaseLayout>
        );
    };

export default NewTaskOrganizer;