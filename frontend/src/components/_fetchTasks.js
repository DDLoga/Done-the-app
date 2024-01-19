import { useState, useEffect } from 'react';

export const useFetchTasks = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = () => {
        fetch('http://127.0.0.1:8000/api/get_tasks', {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => setTasks(data))
        .catch(error => console.error('Error:', error));
    };
    
    fetchTasks();
},[]);

    return tasks;
};