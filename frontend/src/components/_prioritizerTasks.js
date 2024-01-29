import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';

import { fetchTasks } from './_fetchTasks';
import { updateTaskAPI } from './_updateTask';
import { deleteTasksAPI } from './_deleteTasks';

import { fetchProjects } from './_fetchProjects';
import { fetchContexts } from './_fetchContexts';
import { fetchAssignees } from './_fetchAssignees';

import { Select, MenuItem, TextField, Fab, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isValid, parseISO, format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const TasksPrioritizer = () => {

    //////////////////////////////////////////////////////////////  // TASKS API COMMUNICATION //  //////////////////////////////////////////////////////////////
    const {                                                        // useQuery hook to fetch the tasks data into fetchedTasksData
        data: fetchedTasksData, 
        isLoading:isLoadingTasks, 
        error:errorLoadingTasks 
    } = useQuery('fetchedTasksData', fetchTasks);                   // use the function { fetchTasks } from './_fetchTasks' and store the result in fetchedTasksData
    const [tasksData, updateTasksData] = useState([]);              // useState hook to store and update the tasks data

    useEffect(() => {                                               // useEffect hook to update the tasks data state when the fetchedTasksData changes
        updateTasksData(fetchedTasksData);
    }, [fetchedTasksData]);

    const updateTaskMutation = useMutation(updateTaskAPI, {         // function to update task data on the API using useMutation hook with { updateTaskAPI } from './_updateTask';
        onSuccess: (data) => {                                      // onSuccess function to update the tasks data state when the mutation is successful
            const updatedTasksData = tasksData.map((task) =>
                task.id === data.id ? data : task
            );
            updateTasksData(updatedTasksData);
        },
    });

    const updateTask = (params, field, value) => {                  // Function to update the task data on table edit (used in columns definition)
        const updatedTask = tasksData.find((task) => task.id === params.id);
        if (updatedTask) {
            updatedTask[field] = value;
            updateTaskMutation.mutate({ taskId: params.id, updatedTask });
        }
    };
    const handleDelete = async () => {                              // Function to handle the delete button click
        await deleteTasksAPI(selectedRows);
        const updatedTasksData = tasksData.filter((task) =>
            !selectedRows.includes(task.id)
        );
        updateTasksData(updatedTasksData);
        setSelectedRows([]);
        setOpen(false);
    };

    //////////////////////////////////////////////////////////////  // PROJECTS API COMMUNICATION //  //////////////////////////////////////////////////////////////
    const { data: projectsData } = useQuery('fetchProjects', fetchProjects); // Fetch the Projects data

    const getProjectName = (parentId) => {              // Function to get the project name from the project id
        const project = projectsData.find((project) => project.id === parentId);
        return project ? project.project_name : '';
    };

    ///////////////////////////////////////////////////////////////////////  // DIALOG BOX //  ///////////////////////////////////////////////////////////////////////
    const [open, setOpen] = React.useState(false);                // useState hook to store and update the open state of the delete confirmation dialog
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    //////////////////////////////////////////////////////////////  // CONTEXTS AND ASSIGNEES API COMMUNICATION //  //////////////////////////////////////////////////////////////
    const {                                         // useQuery hook to fetch the contexts data into contextsData
        data: contextsData, 
        isLoading:isLoadingContexts, 
        error:errorLoadingContexts
    } = useQuery('fetchContexts', fetchContexts);
    const [contextToIdMapping, setContextToIdMapping] = useState({});   // useState hook to store and update the contexts data
    useEffect(() => {                                // useEffect hook to update the contexts data state when the fetchedContextsData changes
        if (contextsData) {
            let mapping = {};
            contextsData.forEach(context => {
                mapping[context.name] = context.id;
            });
            setContextToIdMapping(mapping);
        }
    }, [contextsData]);

    const {                                          // useQuery hook to fetch the assignees data into assigneesData
        data: assigneesData, 
        isLoading:isLoadingAssignees, 
        error:errorLoadingAssignees 
    } = useQuery('fetchAssignees', fetchAssignees);
    const [assigneeToIdMapping, setAssigneeToIdMapping] = useState({}); // useState hook to store and update the assignees data
    useEffect(() => {                                // useEffect hook to update the assignees data state when the fetchedAssigneesData changes
        if (assigneesData) {
            let mapping = {};
            assigneesData.forEach(assignee => {
                mapping[assignee.name] = assignee.id;
            });
            setAssigneeToIdMapping(mapping);
        }
    }, [assigneesData]);

    // selectedRows is used to store the selected rows in the data grid
    const [selectedRows, setSelectedRows] = useState([]); // Initialize selectedRows with an empty array

    //task table columns definition
    const taskColumns = [
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

    return (
        <div style={{ position: 'relative', height: 400, width: '100%', overflow: 'auto' }}>
            {isLoadingTasks ? (
                <CircularProgress /> // Display a loading spinner if the tasks are still loading
            ) : errorLoadingTasks ? (
                <Alert severity="error">Error loading tasks</Alert> // Display an error message if there was an error loading the tasks
            ) : tasksData !== undefined ? (
                <DataGrid
                    rows={tasksData}
                    columns={taskColumns}
                    checkboxSelection
                    disableRowSelectionOnClick
                    pageSize={tasksData.length}
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectedRows(newSelection);
                    }}
                />
            ) : null}
            {selectedRows.length > 0 && (
                <div>
                    <Fab color="secondary" aria-label="delete" onClick={handleClickOpen} style={{ position: 'absolute', top: 0, right: 0 }}>
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
        </div>
    );
}

export default TasksPrioritizer;