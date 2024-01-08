import React, { useState } from 'react';

const QuickTaskForm = () => {
    const [task, setTask] = useState('');

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
            alert('Task submitted successfully');
            setTask('');
        } else {
            alert('There was an error submitting the task');
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <textarea value={task} onChange={e => setTask(e.target.value)} rows="4" cols="50"></textarea>
            <input type="submit" value="Submit" />
        </form>
    );
};

export default QuickTaskForm;