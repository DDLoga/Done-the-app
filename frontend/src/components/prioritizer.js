import React from 'react';
import { useEffect, useState } from 'react';
import { FetchProjects } from './_fetchProjects';
import { FetchTasks } from './_fetchTasks';
import { FetchContexts } from './_fetchContexts';
import { FetchAssignees } from './_fetchAssignees';
import { useTable } from 'react-table';

const Prioritizer = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [contexts, setContexts] = useState([]);
    const [assignees, setAssignees] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const tasksData = await FetchTasks();
            const projectsData = await FetchProjects();
            const contextsData = await FetchContexts();
            const assigneesData = await FetchAssignees();

            setTasks(tasksData);
            setProjects(projectsData);
            setContexts(contextsData);
            setAssignees(assigneesData);
        };

        fetchData();
    }, []);


    //using the `React.useMemo` hook to memoize the columns configuration for the project table.
    const projectColumns = React.useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'project_name',
            },
            {
                Header: 'Priority',
                accessor: 'project_priority',
            },
            {
                Header: 'Deadline',
                accessor: 'project_deadline',
            },
            {
                Header: 'Status',
                accessor: 'project_status',
            },
            {
                Completed: 'Completed',
                accessor: 'project_complete',
            },
        ],
        []
    );
//using the `React.useMemo` hook to memoize the columns configuration for the task table.
    const taskColumns = React.useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Priority',
                accessor: 'priority',
            },
            {
                Header: 'Deadline',
                accessor: 'deadline',
            },
            {
                Header: 'Status',
                accessor: 'status',
            },
            {
                Header: 'Effort',
                accessor: 'effort',
            },
            {
                Header: 'Context',
                accessor: 'context',
            },
            {
                Header: 'Assignee',
                accessor: 'assignee',
            },
            {
                Header: 'Parent',
                accessor: 'parent',
            },
            {
                Completed: 'Completed',
                accessor: 'complete',
            },
        ],
        []
    );

    const {
        getTableProps: getProjectTableProps,
        getTableBodyProps: getProjectTableBodyProps,
        headerGroups: projectHeaderGroups,
        rows: projectRows,
        prepareRow: prepareProjectRow,
    } = useTable({ columns: projectColumns, data: projects });
    
    const {
        getTableProps: getTaskTableProps,
        getTableBodyProps: getTaskTableBodyProps,
        headerGroups: taskHeaderGroups,
        rows: taskRows,
        prepareRow: prepareTaskRow,
    } = useTable({ columns: taskColumns, data: tasks });

    return (
        <div>
            {/* Project Table */}
            <table {...getProjectTableProps()}>
                <thead>
                    {projectHeaderGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getProjectTableBodyProps()}>
                    {projectRows.map(row => {
                        prepareProjectRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => (
                                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Task Table */}
            <table {...getTaskTableProps()}>
                <thead>
                    {taskHeaderGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTaskTableBodyProps()}>
                    {taskRows.map(row => {
                        prepareTaskRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => (
                                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

}

export default Prioritizer;