import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import BaseLayout from './baseLayout';
import { fetchProjects } from './_fetchProjects';
import { fetchTasks } from './_fetchTasks';
import { FetchContexts } from './_fetchContexts';
import { FetchAssignees } from './_fetchAssignees';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { Select, MenuItem, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isValid, parseISO, format } from 'date-fns';
import Fab from '@mui/material/Fab';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation } from 'react-query';
import { updateProjectAPI } from './_updateProject';


const Prioritizer = () => {
    // use dark theme for the data grid
    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });
    // set the header content to be displayed in the base layout
    const headerContent = "Prioritizer";

    // tasksData, contextsData, and assigneesData are used to populate the data grid
    const { data: tasksData, isLoading:isLoadingTasks, error:errorLoadingTasks } = useQuery('fetchTasks', fetchTasks);
    const contextsData = FetchContexts();
    const assigneesData = FetchAssignees();

    //////////////////////////////////////////////////////////////  // PROJECTS API COMMUNICATION //  //////////////////////////////////////////////////////////////
    const {                                                        // useQuery hook to fetch the projects data
        data: fetchedProjectsData, 
        isLoading:isLoadingProjects, 
        error:errorLoadingProjects 
    } = useQuery('fetchedProjectsData', fetchProjects);
    const [projectsData, updateProjectsData] = useState([]);        // useState hook to store and update the projects data
    useEffect(() => {                                               // useEffect hook to update the projects data state when the fetchedProjectsData changes
        updateProjectsData(fetchedProjectsData);
    }, [fetchedProjectsData]);
    const updateProjectMutation = useMutation(updateProjectAPI, {   // useMutation hook to update the project data on table edit
        onSuccess: (data) => {
            // On success, update the local state with the updated project data
            const updatedProjectsData = projectsData.map((project) =>
                project.id === data.id ? data : project
            );
            updateProjectsData(updatedProjectsData);
        },
    });



    // selectedRows is used to store the selected rows in the data grid
    const [selectedRows, setSelectedRows] = useState([]); // Initialize selectedRows with an empty array


    //project table columns definition
    const projectColumns = [
        // name
        {
            field: 'project_name',
            headerName: 'Name',
            width: 250,
            editable: true, // Make this field editable
        },
        // priority dropdown
        { 
            field: 'project_priority', 
            headerName: 'Priority', 
            width: 80,
            renderCell: (params) => (
                <Select
                    sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }}} // remove the border
                    value={params.value}
                    onChange={(event) => {
                        const updatedProject = projectsData.find((project) => project.id === params.id);
                        console.log('updatedProject', updatedProject);
                        if (updatedProject) {
                            updatedProject.project_priority = event.target.value;
                            updateProjectMutation.mutate({ projectId: params.id, updatedProject });
                        }
                    }}
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
                            sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }}} // remove the border
                            value={date && isValid(date) ? date : null}
                            onChange={(newValue) => {
                                const updatedProject = projectsData.find((project) => project.id === params.id);
                                if (updatedProject) {
                                    updatedProject.project_deadline = newValue ? format(newValue, 'yyyy-MM-dd') : '';
                                    updateProjectMutation.mutate({ projectId: params.id, updatedProject });
                                }
                            }}
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
                    sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }}} // remove the border
                    value={params.value}
                    onChange={(event) => {
                        const updatedProject = projectsData.find((project) => project.id === params.id);
                        if (updatedProject) {
                            updatedProject.project_status = event.target.value;
                            updateProjectMutation.mutate({ projectId: params.id, updatedProject });
                        }
                    }}
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

    //task table columns definition
    const taskColumns = React.useMemo(
        () => [
            {
                field: 'name',
                headerName: 'Name',
                width: 130,
            },
            {
                field: 'priority',
                headerName: 'Priority',
                width: 130,
            },
            {
                field: 'deadline',
                headerName: 'Deadline',
                width: 130,
            },
            {
                field: 'status',
                headerName: 'Status',
                width: 130,
            },
            {
                field: 'effort',
                headerName: 'Effort',
                width: 130,
            },
            {
                field: 'context',
                headerName: 'Context',
                width: 130,
            },
            {
                field: 'assignee',
                headerName: 'Assignee',
                width: 130,
            },
            {
                field: 'parent',
                headerName: 'Parent',
                width: 130,
            },
            {
                field: 'complete',
                headerName: 'Completed',
                width: 130,
                renderCell: (params) => (
                    <input type="checkbox" checked={params.value} readOnly />
                ),
            },
        ],
        []
    );


    return (
        <BaseLayout headerContent={headerContent}>
            <ThemeProvider theme={darkTheme}>
                <div className="flex flex-col text-white p-6 space-y-4 w-full">
                    <div style={{ position: 'relative', height: 400, width: '100%', overflow: 'auto' }}>
                        {!isLoadingProjects && projectsData !== undefined &&  (    // Only render the data grid if the data has been fetched. Should handle error as well and display an error message as well as a loading spinner
                            <DataGrid
                                rows={projectsData} 
                                columns={projectColumns} 
                                checkboxSelection
                                disableRowSelectionOnClick
                                pageSize={projectsData.length} 
                                onRowSelectionModelChange={(newSelection) => {
                                    setSelectedRows(newSelection);
                                }}
                                onCellEditCommit={(params) => {
                                    const updatedProject = projectsData.find((project) => project.id === params.id);
                                    if (updatedProject) {
                                        updatedProject[params.field] = params.value;
                                        updateProjectMutation.mutate({ projectId: params.id, updatedProject });
                                    }
                                }}
                            />
                        )}
                        {selectedRows > 0 && (
                            <Fab color="secondary" aria-label="delete" onClick={() => {
                                const updatedProjectsData = projectsData.filter((project) =>
                                    !selectedRows.includes(project.id)
                                );
                                updateProjectsData(updatedProjectsData);
                                setSelectedRows([]);
                            }} style={{ position: 'absolute', top: 0, right: 0 }}>
                                <DeleteIcon />
                            </Fab>
                        )}
                    </div>
                    <div style={{ height: 400, width: '100%', overflow: 'auto' }}>
                        {!isLoadingTasks && (    // Only render the data grid if the data has been fetched. Should handle error as well and display an error message as well as a loading spinner
                            <DataGrid 
                                rows={tasksData} 
                                columns={taskColumns} 
                                pageSize={tasksData.length}
                            />
                        )}
                    </div>
                </div>
            </ThemeProvider>
        </BaseLayout>
    );
    }

export default Prioritizer;