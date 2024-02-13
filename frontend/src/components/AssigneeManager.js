import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation } from 'react-query';
import { fetchAssignees, createAssignee, updateAssigneeAPI, deleteAssigneeAPI } from './_fetchAssignees';
import BaseLayout from './baselayout';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { fetchWithToken } from './_api';
import { TextField, Fab, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const AssigneeManager = () => {
    const headerContent = "Assignee Manager";                        // headerContent on BaseLayout.js
    const [selectedRows, setSelectedRows] = useState([]);           // rows selected in the table
    const [assigneesData, updateAssigneesData] = useState([]);        // assignee data
    const [name, setName] = useState('');                           // dialog box form fields
    const [description, setDescription] = useState('');

    const {                                                         // fetch the assignees data from the API
        data: fetchedAssigneesData, 
        isLoading:isLoadingAssignees, 
        error:errorLoadingAssignees 
    } = useQuery('fetchedAssigneesData', fetchAssignees);             
    
    useEffect(() => {                                               // loading assignee data on local variable
        if (fetchedAssigneesData) {
            updateAssigneesData(fetchedAssigneesData);
        }
    }, [fetchedAssigneesData]);

    const columns = [                                               // columns for the assignee data table
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
                            onBlur={(event) => updateAssignee(params, 'name', event.target.value)}
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
                            onBlur={(event) => updateAssignee(params, 'description', event.target.value)}
                        />
                    </div>
                </Tooltip>
            ),
        },
    ];

    const updateAssigneeMutation = useMutation(updateAssigneeAPI, {           // useMutation hook to update the assignee data on table edit with { updateAssigneeAPI } from './_updateAssignee';
        onSuccess: (data) => {                                              // onSuccess function to update the assignees data state when the updateAssigneeAPI is successful
            const updatedAssigneesData = assigneesData.map((assignee) =>
                assignee.id === data.id ? data : assignee
            );
            updateAssigneesData(updatedAssigneesData);
        },
    });

    const updateAssignee = (params, field, value) => {               // updateAssignee function to update the assignee data on table edit
        const updatedAssignee = assigneesData.find((assignee) => assignee.id === params.id);
        if (updatedAssignee) {
            updatedAssignee[field] = value;
            const { id, ...updatedAssigneeWithoutId } = updatedAssignee; // create a new object that doesn't include the id to comply with the API
            updateAssigneeMutation.mutate({ assigneeId: params.id, updatedAssignee: updatedAssigneeWithoutId });
        }
    };

    const handleDelete = async () => {                              // Function to handle the delete button click
        await deleteAssigneeAPI(selectedRows);
        const updatedAssignee = assigneesData.filter((assignee) =>
            !selectedRows.includes(assignee.id)
        );
        updateAssigneesData(updatedAssignee);
        setSelectedRows([]);
        setOpenDelete(false);
    };

    const createAssigneeMutation = useMutation(createAssignee, {
        onSuccess: (data) => {
            updateAssigneesData((prevAssigneesData) => [...prevAssigneesData, data]);
        },
    });
    

    const handleSubmit = async () => {
        const userResponse = await fetchWithToken(`${process.env.REACT_APP_API_URL}/getUser/`, { method: 'GET' });
        const userData = await userResponse.json();
        const userId = userData.id;
        const newAssignee = {
            name: name,
            description: description,
            user: userId,
        };
        createAssigneeMutation.mutate(newAssignee);
        setOpenAdd(false);
        setName(''); // reset name
        setDescription(''); // reset description
    };



    const [openAdd, setOpenAdd] = useState(false); // useState hook to store and update the open state of the add assignee dialog
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
                {isLoadingAssignees ? (
                    <CircularProgress />
                ) : errorLoadingAssignees ? (
                    <Alert severity="error">Error loading assignees</Alert>
                ) : assigneesData !== undefined ? (
                    <DataGrid 
                        rows={assigneesData} 
                        columns={columns} 
                        disableRowSelectionOnClick
                        checkboxSelection
                        pageSize={assigneesData.length}
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
                                Are you sure you want to delete the selected assignee(s)?
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

export default AssigneeManager;