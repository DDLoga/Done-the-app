import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';

import { fetchProjectsAPI, updateProjectAPI, deleteProjectsAPI } from './_fetchProjects';
import { fetchTasks } from './_fetchTasks';




import { Select, MenuItem, TextField, Fab, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isValid, parseISO, format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { SelectedRowsContext } from './_prioritizerSelectedRowsContext';


const ProjectsPrioritizer = () => {


    //////////////////////////////////////////////////////////////  // PROJECTS API COMMUNICATION //  //////////////////////////////////////////////////////////////
    const {                                                         // fetch projects data
        data: fetchedProjectsData, 
        isLoading:isLoadingProjects, 
        error:errorLoadingProjects 
    } = useQuery('fetchedProjectsData', fetchProjectsAPI);
    
    const [projectsData, updateProjectsData] = useState([]);        // projectData variable and its setter function
    
    useEffect(() => {                                               // update the projects data state when the fetchedProjectsData changes
        updateProjectsData(fetchedProjectsData);
    }, [fetchedProjectsData]);
    
    const {                                                        // fetching tasks data (used later on in deletion confirmation dialog)
        data: fetchedTasksData, 
        } = useQuery('fetchedTasksData', fetchTasks);
    
    const updateProjectMutation = useMutation(updateProjectAPI, {   // useMutation hook to update the project data on table edit with { updateProjectAPI } from './_updateProject';
        onSuccess: (data) => {                                      // onSuccess function to update the projects data state when the updateProjectAPI is successful
            const updatedProjectsData = projectsData.map((project) =>
                project.id === data.id ? data : project
            );
            updateProjectsData(updatedProjectsData);
        },
    });
    
    const updateProject = (params, field, value) => {               // Function to update the project data on table edit (used in columns definition)
        const updatedProject = projectsData.find(
            (project) => project.id === params.id);
        if (updatedProject) {
            updatedProject[field] = value;
            updateProjectMutation.mutate(
                { projectId: params.id, updatedProject });
        }
    };

    const handleDelete = async () => {                              // Function to handle the delete button click
        await deleteProjectsAPI(selectedRows);
        const updatedProjectsData = projectsData.filter((project) =>
            !selectedRows.includes(project.id)
        );
        updateProjectsData(updatedProjectsData);
        setSelectedRows([]);
        setOpen(false);
    };


    const [open, setOpen] = React.useState(false);                // useState hook to store and update the open state of the delete confirmation dialog
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };



    // selectedRows is used to store the selected rows in the data grid
    const [selectedRows, setSelectedRows] = useState([]);                       // Initialize selectedRows with an empty array
    const [, setSelectedRowsContext] = React.useContext(SelectedRowsContext);   //pass the selectedRows state to the SelectedRowsContext  
    useEffect(() => {
        setSelectedRowsContext(selectedRows);
    }, [selectedRows, setSelectedRowsContext]);



    const generateDeleteMessage = () => {
        let message = "Are you sure you want to delete ";
        const selectedProjectNames = selectedRows.map((rowId) => {
            const project = projectsData.find((project) => project.id === rowId);
            return project ? project.project_name : null;
        });
        const filteredTasks = fetchedTasksData.filter(
            task => task.status !== 'Cn' && task.status !== 'Co'
        );

        const tasksSum = filteredTasks.reduce((acc, task) => {
            if (task.parent && selectedRows.includes(task.parent)) {
                acc++;
            }
            return acc;
        }, 0);
        if (selectedRows.length === 1) {
            message += `'${selectedProjectNames[0]}'`;
            if (tasksSum > 0) {
                message += ` and ${tasksSum} related active task(s)?`;
            } else {
                message += "?";
            }
        } else {
            message += `'${selectedProjectNames[0]}' and ${selectedRows.length - 1} other(s)`;
            if (tasksSum > 0) {
                message += ` with ${tasksSum} related active task(s)?`;
            } else {
                message += "?";
            }
        }
        return message;
    };


    //project table columns definition
    const projectColumns = [
        // name
        {
            field: 'project_name',
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
                            onBlur={(event) => updateProject(params, 'project_name', event.target.value)}
                        />
                    </div>
                </Tooltip>
            ),
        },
        // priority dropdown
        { 
            field: 'project_priority', 
            headerName: 'Priority', 
            width: 80,
            renderCell: (params) => (
                <Select
                    sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }}}
                    value={params.value}
                    onChange={(event) => updateProject(params, 'project_priority', event.target.value)}
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
            field: 'project_deadline', 
            headerName: 'Deadline', 
            width: 200,
            renderCell: (params) => {
                let date = params.value ? parseISO(params.value) : null;
                return (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }}}
                            value={date && isValid(date) ? date : null}
                            onChange={(newValue) => updateProject(params, 'project_deadline', newValue ? format(newValue, 'yyyy-MM-dd') : '')}
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
            field: 'project_status', 
            headerName: 'Status', 
            width: 150,
            renderCell: (params) => (
                <Select
                    sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }}}
                    value={params.value}
                    onChange={(event) => updateProject(params, 'project_status', event.target.value)}
                >
                    <MenuItem value="Co">Completed</MenuItem>
                    <MenuItem value="Cn">Cancelled</MenuItem>
                    <MenuItem value="De">Delegated</MenuItem>
                    <MenuItem value="Ip">In Process</MenuItem>
                    <MenuItem value="Ns">Not Started</MenuItem>
                    <MenuItem value="Wa">Wait for</MenuItem>
                </Select>
            ),
        }
    ];



    return (
        <div className="relative h-1/2 w-full overflow-auto">
            {isLoadingProjects ? (
                <CircularProgress /> // Display a loading spinner if the projects are still loading
            ) : errorLoadingProjects ? (
                <Alert severity="error">Error loading projects</Alert> // Display an error message if there was an error loading the projects
            ) : projectsData !== undefined ? (
                <DataGrid
                    rows={projectsData}
                    columns={projectColumns}
                    checkboxSelection
                    disableRowSelectionOnClick
                    pageSize={projectsData.length}
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
                                {generateDeleteMessage()}
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
};

export default ProjectsPrioritizer;