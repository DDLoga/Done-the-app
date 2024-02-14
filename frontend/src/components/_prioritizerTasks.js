import React, { useState, useEffect,useContext } from 'react';
import { useQuery, useMutation } from 'react-query';

import { fetchTasks } from './_fetchTasks';
import { deleteTasksAPI } from './_fetchTasks';
import { updateTaskAPI } from './_fetchTasks';
import { createTask } from './_fetchTasks'

import { fetchProjectsAPI } from './_fetchProjects';
import { fetchContexts } from './_fetchContexts';
import { fetchAssignees } from './_fetchAssignees';
import { SelectedRowsContext } from './_prioritizerSelectedRowsContext';    // import the SelectedRowsContext from './SelectedRowsContext'

import { Select, MenuItem, TextField, Fab, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isValid, parseISO, format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import { fetchWithToken } from './_api';

const TasksPrioritizer = () => {

    //////////////////////////////////////////////////////////////  // TASKS API COMMUNICATION //  //////////////////////////////////////////////////////////////
    const {                                                        // fetching tasks data to fetchedTasksData by using { fetchTasks } from './_fetchTasks'
        data: fetchedTasksData, 
        isLoading:isLoadingTasks, 
        error:errorLoadingTasks 
    } = useQuery('fetchedTasksData', fetchTasks);
    
    const [tasksData, updateTasksData] = useState([]);              // declare the tasks data variable and the function to update it
    const [filteredTasksData, setFilteredTasksData] = useState([]); // filtering tasks based on selected project

    useEffect(() => {                                               // set tasksData once fetched
        updateTasksData(fetchedTasksData); 
    }, [fetchedTasksData]);

    const [projectSelectedRows, ] = useContext(SelectedRowsContext); // get the selected project IDs from the project table

    useEffect(() => {                                               // update the filteredTasksData when the projectSelectedRows or tasksData change
        const tasks = tasksData || [];                              
        const updatedTasksData = projectSelectedRows.length > 0 ? 
            tasks.filter(task => projectSelectedRows.includes(task.parent)) : tasks;
            
        setFilteredTasksData(updatedTasksData);
    }, [projectSelectedRows, tasksData]);

    const updateTaskMutation = useMutation(updateTaskAPI, {         // update tasks on the server and locally without refetching
        onSuccess: (data) => {                                      
            const updatedTasksData = filteredTasksData.map((task) =>
                task.id === data.id ? data : task
            );
            updateTasksData(updatedTasksData);
        },
    });

    const updateTask = (params, field, value) => {                  // function to collect the updated task and fire the updateTaskMutation
        const updatedTask = filteredTasksData.find((task) => task.id === params.id);
        if (updatedTask) {
            updatedTask[field] = value;
            updateTaskMutation.mutate({ taskId: params.id, updatedTask });
        }
    };
    const handleDelete = async () => {                              // Function to handle the delete button click
        await deleteTasksAPI(selectedRows);
        const updatedTasksData = filteredTasksData.filter((task) =>
            !selectedRows.includes(task.id)
        );
        updateTasksData(updatedTasksData);
        setSelectedRows([]);
        setOpen(false);
    };

    /////////////////////////////////////////////////////////////// handle creation of task BUILDING ////////////////////////
    const createTaskMutation = useMutation(createTask, {
        onSuccess: (data) => {
            const newTask = {
                assignee: null,
                complete: false,
                context: null,
                deadline: null,
                effort: 0,
                id: data.task_id,
                name: data.task_name,
                new_task: false,
                parent: data.parent,
                priority: null,
                status: "Ns",
                user: 1
            };
            updateTasksData((prevTasksData) => [...prevTasksData, newTask]);
        },
    });


    const handleSubmit = async () => {
        const userResponse = await fetchWithToken(`${process.env.REACT_APP_API_URL}/getUser/`, { method: 'GET' });
        const userData = await userResponse.json();
        const userId = userData.id;
        const newTask = {
            name: newTaskName,
            parent: projectSelectedRows[0],
            effort: 0,
            user: userId,
        };
        createTaskMutation.mutate(newTask);
        setOpenAdd(false);
        setName(''); // reset name
    };

    //////////////////////////////////////////////////////////////  // PROJECTS API COMMUNICATION //  //////////////////////////////////////////////////////////////
    const {                                                         // fetch project data from the server
        data: projectsData 
    } = useQuery('fetchProjects', fetchProjectsAPI); 

    const getProjectName = (parentId) => {                          // Function translate the project id to the project name
        const project = projectsData.find((project) => project.id === parentId);
        return project ? project.project_name : '';
    };

    ///////////////////////////////////////////////////////////////////////  // DIALOG BOX //  ///////////////////////////////////////////////////////////////////////
    const [open, setOpen] = React.useState(false);                  // delete dialog states
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    //////////////////////////////////////////////////////////////  // CONTEXTS AND ASSIGNEES API COMMUNICATION //  //////////////////////////////////////////////////////////////
    const {                                                             // fetch contexts data from the server
        data: contextsData, 
        isLoading:isLoadingContexts, 
        error:errorLoadingContexts
    } = useQuery('fetchContexts', fetchContexts);
    
    const [contextToIdMapping, setContextToIdMapping] = useState({});   // populating the context list dropdown
    
    useEffect(() => {                                                   // load the context list once the contextsData is fetched
        if (contextsData) {
            let mapping = {};
            contextsData.forEach(context => {
                mapping[context.name] = context.id;
            });
            setContextToIdMapping(mapping);
        }
    }, [contextsData]);

    const {                                                             // fetch assignees data from the server
        data: assigneesData, 
        isLoading:isLoadingAssignees, 
        error:errorLoadingAssignees 
    } = useQuery('fetchAssignees', fetchAssignees);

    const [assigneeToIdMapping, setAssigneeToIdMapping] = useState({}); // populating the assignee list dropdown
    useEffect(() => {                                                   // fetch the assignee list once the assigneesData is fetched
        if (assigneesData) {
            let mapping = {};
            assigneesData.forEach(assignee => {
                mapping[assignee.name] = assignee.id;
            });
            setAssigneeToIdMapping(mapping);
        }
    }, [assigneesData]);

    ///////////////////////////////////////////////////////////////////////  // task table columns definition//  ///////////////////////////////////////////////////////////////////////
    const [selectedRows, setSelectedRows] = useState([]);               // Initialize tasks selectedRows with an empty array
    const taskColumns = [                                               // Define the columns for the task table
        // name
        {
            field: 'name',
            headerName: 'Name',
            width: 250,
            renderCell: (params) => (
                <Tooltip title={params.value ? params.value.toString() : ''} enterDelay={500}>
                    <div>
                        <TextField
                            sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }}}
                            defaultValue={params.value}
                            onKeyDown={(event) => {
                                if (event.key === ' ') {
                                    event.stopPropagation();
                                }
                                if (event.key === 'a' && event.ctrlKey) {
                                    event.stopPropagation();
                                }
                            }}
                            onBlur={(event) => updateTask(params, 'name', event.target.value)}
                        />
                    </div>
                </Tooltip>
            ),
        },
        // priority dropdown
        { 
            field: 'priority', 
            headerName: 'Priority', 
            width: 80,
            renderCell: (params) => (
                <Select
                    sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }}}
                    value={params.value || ''}
                    onChange={(event) => updateTask(params, 'priority', event.target.value)}
                >
                    <MenuItem value="A">A</MenuItem>
                    <MenuItem value="B">B</MenuItem>
                    <MenuItem value="C">C</MenuItem>
                    <MenuItem value="D">D</MenuItem>
                </Select>
            ),
        },
        // deadline date picker
        { 
            field: 'deadline', 
            headerName: 'Deadline', 
            width: 200,
            renderCell: (params) => {
                let date = params.value ? parseISO(params.value) : null;
                return (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }}}
                            value={date && isValid(date) ? date : null}
                            onChange={(newValue) => updateTask(params, 'deadline', newValue ? format(newValue, 'yyyy-MM-dd') : '')}
                            inputFormat="dd/MM/yy"
                            format="dd/MM/yy"
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                );
            },
        },
        // status dropdown
        { 
            field: 'status', 
            headerName: 'Status', 
            width: 150,
            renderCell: (params) => (
                <Select
                    sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }}}
                    value={params.value || ''}
                    onChange={(event) => updateTask(params, 'status', event.target.value)}
                >
                    <MenuItem value="Co">Completed</MenuItem>
                    <MenuItem value="Cn">Cancelled</MenuItem>
                    <MenuItem value="De">Delegated</MenuItem>
                    <MenuItem value="Ip">In Process</MenuItem>
                    <MenuItem value="Ns">Not Started</MenuItem>
                    <MenuItem value="Wa">Wait for</MenuItem>
                </Select>
            ),
        },
        // effort text field
        {
            field: 'effort',
            headerName: 'Effort',
            width: 130,
            renderCell: (params) => (
                <TextField
                    type="number"
                    sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }}}
                    defaultValue={params.value}
                    onKeyDown={(event) => {
                        if (event.key === ' ') {
                            event.stopPropagation();
                        }
                        if (event.key === 'a' && event.ctrlKey) {
                            event.stopPropagation();
                        }
                    }}
                    onBlur={(event) => updateTask(params, 'effort', parseInt(event.target.value))}
                />
            ),
        },
        // context dropdown
        {
            field: 'context',
            headerName: 'Context',
            width: 130,
            renderCell: (params) => {
                const contextIdToNameMapping = Object.fromEntries(
                    Object.entries(contextToIdMapping).map(([name, id]) => [id, name])
                );
                return (
                    <Select
                        sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }}}
                        value={contextIdToNameMapping[params.value] || ''}
                        onChange={(event) => {
                            const contextName = event.target.value;
                            const contextId = contextToIdMapping[contextName];
                            updateTask(params, 'context', contextId);
                        }}
                    >
                        {isLoadingContexts ? <MenuItem>Loading...</MenuItem> : 
                            errorLoadingContexts ? <MenuItem>Error</MenuItem> :
                            contextsData.map((context) => (
                                <MenuItem key={context.id} value={context.name}>{context.name}</MenuItem>
                            ))
                        }
                    </Select>
                );
            },
        },
        // assignee dropdown
        {
            field: 'assignee',
            headerName: 'Assignee',
            width: 130,
            renderCell: (params) => {
                const assigneeIdToNameMapping = Object.fromEntries(
                    Object.entries(assigneeToIdMapping).map(([name, id]) => [id, name])
                );
                return (
                    <Select
                        sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }}}
                        value={assigneeIdToNameMapping[params.value] || ''}
                        onChange={(event) => {
                            const assigneeName = event.target.value;
                            const assigneeId = assigneeToIdMapping[assigneeName];
                            updateTask(params, 'assignee', assigneeId);
                        }}
                    >
                        {isLoadingAssignees ? <MenuItem>Loading...</MenuItem> : 
                            errorLoadingAssignees ? <MenuItem>Error</MenuItem> :
                            assigneesData.map((assignee) => (
                                <MenuItem key={assignee.id} value={assignee.name}>{assignee.name}</MenuItem>
                            ))
                        }
                    </Select>
                );
            },
        },
        // parent field
        {
            field: 'parent',
            headerName: 'Parent',
            width: 130,
            valueGetter: (params) => projectsData && getProjectName(params.value),
            renderCell: (params) => (
                <Tooltip title={projectsData && params.value ? params.value : ''} enterDelay={500}>
                    <div>
                        {projectsData && params.value}
                    </div>
                </Tooltip>
            ),
        },
    ];


    // create the handleCloseNewTask function to close the dialog box
    const handleCloseNewTask = () => {
        setOpenAdd(false);
    };

    
    const [newTaskName, setName] = useState('');                           // dialog box form fields
    const [openAdd, setOpenAdd] = useState(false); // useState hook to store and update the open state of the add assignee dialog
    
    const handleAdd = () => {
        setOpenAdd(true);
    };

    return (
        <div className="relative h-96 w-full overflow-auto">
            {isLoadingTasks ? (
                <CircularProgress /> // Display a loading spinner if the tasks are still loading
            ) : errorLoadingTasks ? (
                <Alert severity="error">Error loading tasks</Alert> // Display an error message if there was an error loading the tasks
            ) : filteredTasksData !== undefined ? (
                <DataGrid
                    rows={filteredTasksData}
                    columns={taskColumns}
                    checkboxSelection
                    disableRowSelectionOnClick
                    pageSize={filteredTasksData.length}
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectedRows(newSelection);
                    }}
                />
            ) : null}
            {selectedRows.length > 0 && (
                <div className="absolute top-0 right-16 flex space-x-2">
                    <Fab color="secondary" aria-label="delete" onClick={handleClickOpen}>
                        <DeleteIcon />
                    </Fab>
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Are you sure you want to delete the selected project(s)?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleDelete} autoFocus>
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            )}
            <div className="absolute top-0 right-0 flex space-x-0">
                <Fab color="primary" aria-label="add" onClick={handleAdd} style={{ marginRight: 10 }}>
                    <AddIcon />
                </Fab>
            </div>
            <Dialog
                open={openAdd}
                onClose={handleCloseNewTask}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Add Assignee"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Please enter the name and description for the new assignee.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        type="text"
                        fullWidth
                        value={newTaskName}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {/* <TextField
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    /> */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNewTask}>Cancel</Button>
                    <Button onClick={handleSubmit} autoFocus>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default TasksPrioritizer;