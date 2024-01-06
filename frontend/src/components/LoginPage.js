import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext'; // Import your UserContext

const LoginPage = () => {
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
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label>
                    Password:
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} />
                </label>
                <input type="submit" value="Submit" />
            </form>
        </div>
    );
};

export default LoginPage;