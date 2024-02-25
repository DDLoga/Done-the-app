import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from './baselayout';
import loginPageStyle from './loginPage.module.css';
import { Link } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

const RegisterPage = () => {
    const headerContent = "Register Page";
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [successDialogMessage, setSuccessDialogMessage] = useState('');

    const navigate = useNavigate();

    const register = async (username, password, password2) => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, password2 })
            });
            const data = await response.json();
            if (response.ok && !data.error) {
                setError(null);
                setSuccessDialogMessage('Registration successful. You can now proceed to login');
                setSuccessDialogOpen(true);
                return true;
            } else {
                setError(data.error || 'Registration failed');
                const errorMessage = data.username ? data.username[0] : 'Registration failed';
                setDialogMessage(errorMessage);
                setDialogOpen(true);
                return false;
            }
        } catch (error) {
            console.error('Network error:', error);
            setError('Network error: Could not connect to the server');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setDialogOpen(false);
    };

    const handleSuccessClose = () => {
        setSuccessDialogOpen(false);
        navigate('/login');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await register(username, password, password2);
    };

    return (
        <BaseLayout headerContent={headerContent}>
            <div className={loginPageStyle.loginForm}>
                <div className={loginPageStyle.container}>
                    <h2>Register</h2>
                    <form onSubmit={handleSubmit} className={loginPageStyle.form}>
                        <label>
                            Username:
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                className={loginPageStyle.input}
                            />
                        </label>
                        <label>
                            Password:
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className={loginPageStyle.input}
                            />
                        </label>
                        <label>
                            Confirm Password:
                            <input 
                                type="password" 
                                value={password2} 
                                onChange={(e) => setPassword2(e.target.value)} 
                                className={loginPageStyle.input}
                            />
                        </label>
                        <input type="submit" value="Submit" className={loginPageStyle.submit} />

                    </form>
                    <p>Already have an account? <Link to="/login" className="text-blue-500 underline hover:text-blue-800">Login</Link></p>
                    {loading && <div>Loading...</div>}
                    {error && <div>Error: {error}</div>}
                </div>
            </div>
            {dialogOpen && (
                <Dialog open={dialogOpen} onClose={handleClose}>
                    <DialogTitle>Error</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{dialogMessage}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
            {successDialogOpen && (
                <Dialog open={successDialogOpen} onClose={handleSuccessClose}>
                    <DialogTitle>Success</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{successDialogMessage}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleSuccessClose}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </BaseLayout>
    );
};

export default RegisterPage;