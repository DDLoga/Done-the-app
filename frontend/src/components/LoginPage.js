import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext'; // Import your UserContext
import BaseLayout from './baseLayout';
import loginPageStyle from './loginPage.module.css';

const LoginPage = () => {
    const headerContent = "Login Page";
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { login } = useContext(UserContext); // Use the login function from context

    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Call the login function from context
        const success = await login(username, password);

        if (success) {
            console.log('you are logged in');
            // Redirect the user to the home page (or wherever you want to redirect them)
            navigate('/');
        } else {
            // Handle login failure
            console.error('Login failed');
        }
    };

    return (
        <BaseLayout headerContent={headerContent}>
            <div className={loginPageStyle.loginForm}>
                <div className={loginPageStyle.container}>
                    <h2>Login</h2>
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
                        <input type="submit" value="Submit" className={loginPageStyle.submit} />
                    </form>
                </div>
            </div>
        </BaseLayout>
    );
};

export default LoginPage;