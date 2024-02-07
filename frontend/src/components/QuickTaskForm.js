import React, { useState } from 'react';
import styles from "./QuickTaskForm.module.css";
import BaseLayout from './baselayout';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { TextField, Button, CircularProgress } from '@mui/material';

const QuickTaskForm = () => {
    const [task, setTask] = useState('');
    const [isLoading, setIsLoading] = useState(false);                  // handle loading state for the spinner

    // dialog box variables
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [severity, setSeverity] = useState('success');

    // communication with backend
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true); // set loading status to true before starting the API request

        try {
            // Get user_id from backend
            const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/getUser/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            const userData = await userResponse.json();
            const userId = userData.id;

            const response = await fetch(`${process.env.REACT_APP_API_URL}/quickTask/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name: task, user: userId })
            });
            if (response.ok) {
                setDialogMessage('Submitted successfully');
                setSeverity('success');
                setTask('');
            } else {
                setDialogMessage('There was an error submitting the task');
                setSeverity('error');
            }
        } catch (error) {
            setDialogMessage('Cannot reach the server');
            setSeverity('error');
        }

        setOpenSnackbar(true);
        setIsLoading(false); // set loading status to false after the API request is done
    };

    return (
        <BaseLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.logo}>Logo</div>
                    <h2 className={styles.subtitle}>Clear your mind</h2>
                </div>
                <div className={styles.formBlock} onSubmit={handleSubmit}>
                    <form>
                        <TextField
                            multiline
                            rows={15}
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            variant="outlined"
                            fullWidth
                            color="primary"
                            placeholder="Write your task here, separate with a new line"
                        />
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            style={{ marginTop: '10px' }}
                            disabled={isLoading} // disable the button while loading
                        >
                            {isLoading ? <CircularProgress size={24} /> : 'Submit'}
                        </Button>
                    </form>
                </div>
            </div>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity={severity} sx={{ width: '100%' }}>
                    {dialogMessage}
                </Alert>
            </Snackbar>
        </BaseLayout>
    )
};

export default QuickTaskForm;