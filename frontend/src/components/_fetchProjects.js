import { useState, useEffect } from 'react';

export const useFetchProjects = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchProjects = () => {
            fetch('http://127.0.0.1:8000/api/get_projects', {
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
            .then(data => setProjects(data))
            .catch(error => console.error('Error:', error));
        };

        fetchProjects();
    }, []);

    return projects;
};