import { useState, useEffect } from 'react';

export const useFetchContexts = () => {
    const [contexts, setContexts] = useState([]);

    useEffect(() => {
        const fetchContexts = () => {
            fetch('http://127.0.0.1:8000/api/get_contexts', {
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
            .then(data => setContexts(data))
            .catch(error => console.error('Error:', error));
        };

        fetchContexts();
    }, []);

    return contexts;
};
