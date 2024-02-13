import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation } from 'react-query';
import { fetchContexts, createContext, updateContextAPI, deleteContextAPI } from './_fetchContexts';
import BaseLayout from './baselayout';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { fetchWithToken } from './_api';
import { TextField, Fab, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const ContextManager = () => {
    const headerContent = "Context Manager";                        // headerContent on BaseLayout.js
    const [selectedRows, setSelectedRows] = useState([]);           // rows selected in the table
    const [contextsData, updateContextsData] = useState([]);        // context data
    const [name, setName] = useState('');                           // dialog box form fields
    const [description, setDescription] = useState('');

    const {                                                         // fetch the contexts data from the API
        data: fetchedContextsData, 
        isLoading:isLoadingContexts, 
        error:errorLoadingContexts 
    } = useQuery('fetchedContextsData', fetchContexts);             
    
    useEffect(() => {                                               // loading context data on local variable
        if (fetchedContextsData) {
            updateContextsData(fetchedContextsData);
        }
    }, [fetchedContextsData]);

    const columns = [                                               // columns for the context data table
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

    const handleDelete = async () => {                              // Function to handle the delete button click
        await deleteContextAPI(selectedRows);
        const updatedContext = contextsData.filter((context) =>
            !selectedRows.includes(context.id)
        );
        updateContextsData(updatedContext);
        setSelectedRows([]);
        setOpenDelete(false);
    };

    const createContextMutation = useMutation(createContext, {
        onSuccess: (data) => {
            updateContextsData((prevContextsData) => [...prevContextsData, data]);
        },
    });
    


    const handleSubmit = async () => {
        const userResponse = await fetchWithToken(`${process.env.REACT_APP_API_URL}/getUser/`, { method: 'GET' });
        const userData = await userResponse.json();
        const userId = userData.id;
        const newContext = {
            name: name,
            description: description,
            user: userId,
        };
        createContextMutation.mutate(newContext);
        setOpenAdd(false);
        setName(''); // reset name
        setDescription(''); // reset description
    };



    const [openAdd, setOpenAdd] = useState(false); // useState hook to store and update the open state of the add context dialog
    const [openDelete, setOpenDelete] = useState(false); // useState hook to store and update the open state of the delete confirmation dialog

    const handleAdd = () => {
        setOpenAdd(true);
    };

    const handleClickOpenDelete = () => {
        setOpenDelete(true);
    };

    const handleClose = () => {
        setOpenAdd(false);
        setOpenDelete(false);
    };

    return (
        <BaseLayout headerContent={headerContent}>
            <div style={{ height: 400, width: '100%', position: 'relative' }}>
                {isLoadingContexts ? (
                    <CircularProgress />
                ) : errorLoadingContexts ? (
                    <Alert severity="error">Error loading contexts</Alert>
                ) : contextsData !== undefined ? (
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
                ) : null}
                <div style={{ position: 'absolute', top: 0, right: 0 }}>
                    <Fab color="primary" aria-label="add" onClick={handleAdd} style={{ marginRight: 10 }}>
                        <AddIcon />
                    </Fab>
                    {selectedRows.length > 0 && (
                        <Fab color="secondary" aria-label="delete" onClick={handleClickOpenDelete}>
                            <DeleteIcon />
                        </Fab>
                    )}
                    <Dialog
                        open={openAdd}
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{"Add Context"}</DialogTitle>
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
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <TextField
                                margin="dense"
                                label="Description"
                                type="text"
                                fullWidth
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleSubmit} autoFocus>
                                Add
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        open={openDelete}
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Are you sure you want to delete the selected context(s)?
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
            </div>
        </BaseLayout>
    );
}

export default ContextManager;