import React, { useState } from 'react';
import styles from "./QuickTaskForm.module.css";
import BaseLayout from './baselayout';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Link } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import { TextField, Button, CircularProgress } from '@mui/material';

const QuickTaskForm = () => {
    const headerContent = "New Task Capture";
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
                body: JSON.stringify({ name: task, user: userId, new_task: true})
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
        <BaseLayout headerContent={headerContent}>
            <div className={styles.container}>
                <div className={styles.header}>
                    {/* <div className={styles.logo}>Logo</div> */}
                    <h2 className={styles.subtitle}>Clear your mind</h2>
                </div>
                <div className={styles.formBlock}>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            variant="outlined"
                            fullWidth
                            color="primary"
                            placeholder="Write here your task, thoughts or whatever is in your head. We'll figure it out later together."
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Tooltip title="Submit your new thought or just press enter">
                                <span>
                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        color="primary"
                                        style={{ marginTop: '10px', marginRight: '10px' }}
                                        disabled={isLoading} // disable the button while loading
                                    >
                                        {isLoading ? <CircularProgress size={24} /> : 'Submit'}
                                    </Button>
                                </span>
                            </Tooltip>
                            <p style={{ alignSelf: 'center', margin: '10px' }}>or</p>
                            <Link to="/newtaskorganizer">
                                <Tooltip title="Your mind is clear? Proceed to the new task Organizer wizard">
                                    <span>
                                        <Button 
                                            variant="contained" 
                                            color="primary"
                                            style={{ marginTop: '10px' }}
                                        >
                                            Organize
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Link>
                        </div>
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