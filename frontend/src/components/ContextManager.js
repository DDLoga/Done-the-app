import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation } from 'react-query';
import { fetchContexts, createContext, updateContextAPI, deleteContext } from './_fetchContexts';
import BaseLayout from './baselayout';
import { Select, MenuItem, TextField, Fab, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const ContextManager = () => {
    const headerContent = "Context Manager";                        // headerContent to be displayed on the page. reference to BaseLayout.js

    const [selectedRows, setSelectedRows] = useState([]);


    const {                                                        // useQuery hook to fetch the context data into fetchedContextsData
        data: fetchedContextsData, 
        isLoading:isLoadingContexts, 
        error:errorLoadingContexts 
    } = useQuery('fetchedProjectsData', fetchContexts);             // use the function { fetchContexts } from './_fetchContexts' and stores data into fetchedContextsData
    
    const [contextsData, updateContextsData] = useState([]);        // useState hook to store and update the contexts data

    useEffect(() => {                                               // only update contextsData when fetchedContextsData is defined (prevent error on table render when fetchedContextsData is undefined)
        if (fetchedContextsData) {
            updateContextsData(fetchedContextsData);
        }
    }, [fetchedContextsData]);

    const columns = [
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
                            onBlur={(event) => updateContext(params, 'name', event.target.value)}
                        />
                    </div>
                </Tooltip>
            ),
        },
        { 
            field: 'description', 
            headerName: 'Description', 
            width: 300, 
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
                            onBlur={(event) => updateContext(params, 'description', event.target.value)}
                        />
                    </div>
                </Tooltip>
            ),
        },
    ];

    const updateContextMutation = useMutation(updateContextAPI, {           // useMutation hook to update the context data on table edit with { updateContextAPI } from './_updateContext';
        onSuccess: (data) => {                                              // onSuccess function to update the contexts data state when the updateContextAPI is successful
            const updatedContextsData = contextsData.map((context) =>
                context.id === data.id ? data : context
            );
            updateContextsData(updatedContextsData);
        },
    });

    const updateContext = (params, field, value) => {               // updateContext function to update the context data on table edit
        const updatedContext = contextsData.find((context) => context.id === params.id);
        if (updatedContext) {
            updatedContext[field] = value;
            const { id, ...updatedContextWithoutId } = updatedContext; // create a new object that doesn't include the id to comply with the API
            updateContextMutation.mutate({ contextId: params.id, updatedContext: updatedContextWithoutId });
        }
    };

    return (
        <BaseLayout headerContent={headerContent}>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid 
                    rows={contextsData} 
                    columns={columns} 
                    disableRowSelectionOnClick
                    checkboxSelection
                    pageSize={contextsData.length}
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectedRows(newSelection);
                    }}
                />
            </div>
        </BaseLayout>
    );
};

export default ContextManager;