// used in new task organizer and priority
import { useState, useEffect } from 'react';

export const useFetchAssignees = () => {
    const [assignees, setAssignees] = useState([]);

    useEffect(() => {
        const fetchAssignees = () => {
            fetch('http://127.0.0.1:8000/api/get_assignees', {
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
            .then(data => setAssignees(data))
            .catch(error => console.error('Error:', error));
        };

        fetchAssignees();
    }, []);

    return assignees;
};
