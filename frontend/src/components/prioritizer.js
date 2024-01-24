import React, { useState, useEffect } from 'react';
import BaseLayout from './baseLayout';
import { useFetchProjects } from './_fetchProjects';
import { useFetchTasks } from './_fetchTasks';
import { FetchContexts } from './_fetchContexts';
import { FetchAssignees } from './_fetchAssignees';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import {Select, MenuItem, TextField} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isValid, parseISO, format } from 'date-fns';
import { enGB } from 'date-fns/locale';

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
    const tasksData = useFetchTasks();
    const contextsData = FetchContexts();
    const assigneesData = FetchAssignees();

    // fetch the projects data on load with useEffect and update the state with useState on table edit
    const fetchedProjectsData = useFetchProjects(); 
    const [projectsData, updateProjectsData] = useState([]);
    useEffect(() => {
        updateProjectsData(fetchedProjectsData);
    }, [fetchedProjectsData]);


    //project table columns
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
                    value={params.value}
                    onChange={(event) => {
                        const updatedProjectsData = projectsData.map((project) =>
                            project.id === params.id ? { ...project, project_priority: event.target.value } : project
                        );
                        updateProjectsData(updatedProjectsData);
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
                            value={date && isValid(date) ? date : null}
                            onChange={(newValue) => {
                                const updatedProjectsData = projectsData.map((project) =>
                                    project.id === params.id ? { ...project, project_deadline: newValue ? format(newValue, 'yyyy-MM-dd') : '' } : project
                                );
                                updateProjectsData(updatedProjectsData);
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
                    value={params.value}
                    onChange={(event) => {
                        const updatedProjectsData = projectsData.map((project) =>
                            project.id === params.id ? { ...project, project_status: event.target.value } : project
                        );
                        updateProjectsData(updatedProjectsData);
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
        },
    ];
    //task table columns
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
                    <div style={{ height: 400, width: '100%', overflow: 'auto' }}>
                    <DataGrid 
                        rows={projectsData} 
                        columns={projectColumns} 
                        checkboxSelection
                        pageSize={projectsData.length} 
                        onCellEditCommit={(params, event) => {
                            if (params.field === 'project_name') {
                            // Update your data here
                            const updatedProjectsData = projectsData.map((project) =>
                                project.id === params.id ? { ...project, project_name: params.value } : project
                            );
                            updateProjectsData(updatedProjectsData);
                            }
                        }}
                        />
                    </div>
                    <div style={{ height: 400, width: '100%', overflow: 'auto' }}>
                        <DataGrid 
                            rows={tasksData} 
                            columns={taskColumns} 
                            pageSize={tasksData.length} 
                        />
                    </div>
                </div>
            </ThemeProvider>
        </BaseLayout>
    );
    }
export default Prioritizer;