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
        const response = await fetch('http://localhost:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });
    
        if (response.ok) {
            const data = await response.json();
            setUser(data.username); // Update the user state
            return true; // Return true to indicate that the login was successful
        } else {
            return false; // Return false to indicate that the login failed
        }
    };


    return (
        <Router>
            <div className={styles.appContainer}>
                <UserContext.Provider value={{ user, login }}>
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