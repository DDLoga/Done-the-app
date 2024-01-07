import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import SideMenu from "./components/sidemenu";
import LoginPage from './components/LoginPage';
import UserContext from './components/UserContext';


const App = () => {
    const [user, setUser] = useState(localStorage.getItem('username') || null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUser(storedUsername);
        }
    }, []);

    const login = async (username, password) => {
        // Call your API to log in the user
        const response = await fetch('http://127.0.0.1:8000/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            const data = await response.json();
            setUser(data.username);  // Set the user state
            localStorage.setItem('username', data.username);  // Store the username
            localStorage.setItem('token', data.token);  // Store the token
            return true;
        } else {
            return false;
        }
    };

    const logout = async () => {
        try {
            // Send a POST request to the logout endpoint
            const response = await fetch('http://127.0.0.1:8000/api/logout/', {
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
        <Router>
            <div className={styles.appContainer}>
                <UserContext.Provider value={{ user, login, logout }}>
                    <SideMenu />
                
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/login" element={<LoginPage login={login} />} />
                    </Routes>
                </UserContext.Provider>
            </div>
        </Router>
    );
};

export default App;