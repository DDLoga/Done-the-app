import axios from 'axios';



export const fetchContexts = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/get_contexts`, {
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
};

export const createContext = async (context) => {
    
    const response = await fetch(`${process.env.REACT_APP_API_URL}/get_contexts/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(context)
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
};

export const updateContextAPI = async (contextId) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/get_contexts/${contextId.contextId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(contextId.updatedContext)
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
};

export const deleteContextAPI = async (contextId) => {
    const responses = await Promise.all(contextId.map(contextIdSingle =>
        axios.delete(`${process.env.REACT_APP_API_URL}/get_contexts/${contextIdSingle}/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        })
    ));

    return responses.map(response => response.data);
};