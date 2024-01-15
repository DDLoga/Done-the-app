import React, { useState } from 'react';
import styles from "./QuickTaskForm.module.css";
import BaseLayout from './baseLayout';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { TextField, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const QuickTaskForm = () => {
    const [task, setTask] = useState('');

    // dialog box variables
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    
    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#0084FF', // monday.com's primary color
            },
            background: {
                default: '#1A1A1A', // monday.com's background color
            },
        },
    });








    // communication with backend
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Get user_id from backend
        const userResponse = await fetch('http://127.0.0.1:8000/api/getUser/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        });
        const userData = await userResponse.json();
        const userId = userData.id;

        const response = await fetch('http://127.0.0.1:8000/api/quickTask/', {
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
        setOpenSnackbar(true);
    };


    return (
        <BaseLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.logo}>Logo</div>
                    <h2 className={styles.subtitle}>Clear your mind</h2>
                </div>
                <div className={styles.formBlock} onSubmit={handleSubmit}>
                    <ThemeProvider theme={darkTheme}>
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
                            >
                                Submit
                            </Button>
                        </form>
                    </ThemeProvider>
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