import React, { useState, useEffect} from 'react';
import styles from './App.module.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import RegisterPage from './components/RegisterPage';
import SideMenu from "./components/sidemenu";
import LoginPage from './components/LoginPage';
import UserContext from './components/UserContext';
import QuickTaskForm from './components/QuickTaskForm';
import NewTaskOrganizer from './components/newTaskOrganizer';
import NextTaskCapture from './components/NextTaskCapture';
import PrioritizerTasks from './components/prioritizerTasks';
import PrioritizerProjects from './components/prioritizerProjects';
import ContextManager from './components/ContextManager';
import AssigneeManager from './components/AssigneeManager';
import WelcomeMessage from './components/welcomeMessage';
import Calendar from './components/Calendar';
import OAuth2Callback from './components/_OAuth2Callback';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';



const queryClient = new QueryClient();

const App = () => {

    const darkTheme = createTheme({                     // create a dark theme
        palette: {
            mode: 'dark',
        },
    });

    const [user, setUser] = useState(                   // get the username from local storage
        localStorage.getItem('username') || null);

    useEffect(() => {                                   // set the user state to the stored username
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUser(storedUsername);
        }
    }, []);

    const [error, setError] = useState(null);   // handle login errors
    const [open, setOpen] = useState(false);    // handle dialog open state
    const handleClose = () => {
        setOpen(false);
        setError(null); // Reset the error state when the dialog is closed
    };

    const [loading, setLoading] = useState(false);  // handle loading state for the spinner

    const login = async (username, password) => {   // handle login function
        setLoading(true);                           // set loading state to true to activate the spinner
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok && !data.error) {
                setUser(data.username);  // Set the user state
                localStorage.setItem('username', data.username);  // Store the username
                localStorage.setItem('token', data.token);  // Store the token
                setOpen(false); // Close the dialog box if the login is successful
                setError(null);  // Clear any previous errors
                return true;
            } else {
                console.error('Login failed:', data);
                setError(data.error || 'Login failed');
                setOpen(true); // Open the dialog box if the login fails
                return false;
            }
        } catch (error) {
            console.error('Network error:', error);
            setError('Network error: Could not connect to the server');
            setOpen(true); // Open the dialog box if there is a network error
            return false;
        } finally {
            setLoading(false); // Set loading to false when the request finishes to deactivate the spinner
        }
    };

    useEffect(() => {                           // handle login errors by opening a dialog box with the error message
        if (error) {
            setOpen(true);
        }
    }, [error]);

    const logout = async () => {
        try {
            // Send a POST request to the logout endpoint
            const response = await fetch(`${process.env.REACT_APP_API_URL}/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include the token in the Authorization header
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });

            // Check if the request was successful
            if (response.ok) {
                // Clear local storage
                localStorage.clear();
                // Optionally, update the state to reflect that the user is logged out
                setUser(null);
            } else {
                console.error('Logout failed:', response);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={darkTheme}>
                <Router>
                    <div className={styles.appContainer}>
                        <UserContext.Provider value={{ user, login, logout }}>
                            <SideMenu />
                            
                            <Routes>
                                <Route path="/oauth2callback" element={<OAuth2Callback />} />
                                <Route 
                                    path="/" 
                                    element={user ? <WelcomeMessage /> : <Login />}
                                />
                                <Route 
                                    path="/login" 
                                    element={<LoginPage login={login} />} />
                                <Route 
                                    path="/register" 
                                    element={<RegisterPage />} />
                                <Route 
                                    path="/quickTask" 
                                    element={user ? <QuickTaskForm /> : <Navigate to="/login" replace />}
                                />
                                <Route 
                                    path="/nexttaskcapture" 
                                    element={user ? <NextTaskCapture /> : <Navigate to="/login" replace />}
                                />
                                <Route 
                                    path="/newtaskorganizer" 
                                    element={user ? <NewTaskOrganizer /> : <Navigate to="/login" replace />}
                                />
                                {/* <Route                                              // discontinued, too complex and useless
                                    path="/prioritizer" 
                                    element={user ? <Prioritizer /> : <Navigate to="/login" replace />}
                                /> */}
                                <Route 
                                    path="/prioritizerProjects" 
                                    element={user ? <PrioritizerProjects /> : <Navigate to="/login" replace />}
                                />
                                <Route 
                                    path="/prioritizerTasks" 
                                    element={user ? <PrioritizerTasks /> : <Navigate to="/login" replace />}
                                />
                                <Route 
                                    path="/contextmanager" 
                                    element={user ? <ContextManager /> : <Navigate to="/login" replace />}
                                />
                                <Route 
                                    path="/assigneemanager" 
                                    element={user ? <AssigneeManager /> : <Navigate to="/login" replace />}
                                />
                                <Route 
                                    path="/calendar" 
                                    element={user ? <Calendar /> : <Navigate to="/login" replace />}
                                />
                            </Routes>
                        </UserContext.Provider>
                    </div>
                </Router>
                {loading && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <CircularProgress />
                    </div>
                )}
                <Dialog
                    open={open} // Open the dialog if there is an error
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Error"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                        {error}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary" autoFocus>
                        OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;