import React from 'react';
import BaseLayout from './baseLayout';
import { useFetchProjects } from './_fetchProjects';
import { useFetchTasks } from './_fetchTasks';
import { FetchContexts } from './_fetchContexts';
import { FetchAssignees } from './_fetchAssignees';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';

const Prioritizer = () => {
    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });
    const headerContent = "Prioritizer";


    const tasksData = useFetchTasks();
    // filter tasksData to only include tasks that are not new (new_task : false)
    const filteredTasksData = tasksData.filter(task => task.new_task === false);
    console.log('here is the tasks data')
    console.log(filteredTasksData)
    const projectsData = useFetchProjects();
    console.log('here is the projects data')
    console.log(projectsData)
    const contextsData = FetchContexts();
    const assigneesData = FetchAssignees();





    //using the `React.useMemo` hook to memoize the columns configuration for the project table.
    const projectColumns = [
        { field: 'id', headerName: 'ID', width: 70, resizable: true },
        { field: 'project_name', headerName: 'Name', width: 130, resizable: true },
        { field: 'project_priority', headerName: 'Priority', width: 130, resizable: true },
        { field: 'project_deadline', headerName: 'Deadline', width: 130, resizable: true },
        { field: 'project_status', headerName: 'Status', width: 130, resizable: true },
        { 
            field: 'project_complete', 
            headerName: 'Completed', 
            width: 130, 
            resizable: true,
            renderCell: (params) => (
                <input type="checkbox" checked={params.value} readOnly />
            ),
        },
    ];
    //using the `React.useMemo` hook to memoize the columns configuration for the task table.
    const taskColumns = React.useMemo(
        () => [
            {
                field: 'name',
                headerName: 'Name',
                width: 130,
                resizable: true,
            },
            {
                field: 'priority',
                headerName: 'Priority',
                width: 130,
                resizable: true,
            },
            {
                field: 'deadline',
                headerName: 'Deadline',
                width: 130,
                resizable: true,
            },
            {
                field: 'status',
                headerName: 'Status',
                width: 130,
                resizable: true,
            },
            {
                field: 'effort',
                headerName: 'Effort',
                width: 130,
                resizable: true,
            },
            {
                field: 'context',
                headerName: 'Context',
                width: 130,
                resizable: true,
            },
            {
                field: 'assignee',
                headerName: 'Assignee',
                width: 130,
                resizable: true,
            },
            {
                field: 'parent',
                headerName: 'Parent',
                width: 130,
                resizable: true,
            },
            {
                field: 'complete',
                headerName: 'Completed',
                width: 130,
                resizable: true,
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
                            pageSize={projectsData.length} 
                        />
                    </div>
                    <div style={{ height: 400, width: '100%', overflow: 'auto' }}>
                        <DataGrid 
                            rows={filteredTasksData} 
                            columns={taskColumns} 
                            pageSize={filteredTasksData.length} 
                        />
                    </div>
                </div>
            </ThemeProvider>
        </BaseLayout>
    );
    }
export default Prioritizer;