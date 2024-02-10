import axios from 'axios';

const apiCall = async (url, method, body = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, options);

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
};

export const fetchContexts = async () => {
    return await apiCall('/get_contexts', 'GET');
};

export const createContext = async (context) => {
    return await apiCall('/get_contexts/', 'POST', context);
};

export const updateContextAPI = async (contextId) => {
    return await apiCall(`/get_contexts/${contextId.contextId}/`, 'PUT', contextId.updatedContext);
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