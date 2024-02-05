import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from './baselayout';
import loginPageStyle from './loginPage.module.css';

const RegisterPage = () => {
    const headerContent = "Register Page";
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const register = async (username, password) => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok && !data.error) {
                console.log('Registration successful:', data);
                setError(null);
                navigate('/login');
                return true;
            } else {
                console.error('Registration failed:', data);
                setError(data.error || 'Registration failed');
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        await register(username, password);
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
                        <input type="submit" value="Submit" className={loginPageStyle.submit} />
                    </form>
                    {loading && <div>Loading...</div>}
                    {error && <div>Error: {error}</div>}
                </div>
            </div>
        </BaseLayout>
    );
};

export default RegisterPage;