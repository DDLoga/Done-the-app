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
    const response = await fetch(`${process.env.REACT_APP_API_URL}/create_context`, {
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

export const deleteContext = async (id) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/get_contexts/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.status;
};