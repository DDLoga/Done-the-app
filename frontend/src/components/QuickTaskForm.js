import React, { useState } from 'react';
import styles from "./QuickTaskForm.module.css";
import BaseLayout from './baseLayout';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


const QuickTaskForm = () => {
    const [task, setTask] = useState('');

    // dialog box variables
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    
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
                    <form className={styles.form}>
                        <textarea
                            className={styles.input}
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            rows="4"
                            cols="50"
                        ></textarea>
                        <input 
                            className={styles.submit}
                            type="submit" 
                            value="Submit" 
                        />
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