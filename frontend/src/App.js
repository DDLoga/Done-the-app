import React, { useState } from 'react';
import styles from './App.module.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import SideMenu from "./components/sidemenu";
import LoginPage from './components/LoginPage';
import UserContext from './components/UserContext';


const App = () => {
    const [user, setUser] = useState(null);

    const login = async (username, password) => {
        // Call your API to log in the user
        const response = await fetch('http://127.0.0.1:8000/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            const data = await response.json();
            setUser(data.user);  // Set the user state
            localStorage.setItem('token', data.token);  // Store the token
            return true;
        } else {
            return false;
        }
    };

    const logout = () => {
        setUser(null); // Clear the user state
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