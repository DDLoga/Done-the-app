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

export const fetchTasks = async () => {
    return await apiCall('/get_tasks', 'GET');
};

export const updateTaskAPI = async (taskId) => {
    return await apiCall(`/NtoTask/${taskId.taskId}/`, 'PUT', taskId.updatedTask);
};

export const createTask = async (task) => {
    return await apiCall('/NtoTask/', 'POST', task);
};

export const deleteTasksAPI = async (taskIds) => {
    const responses = await Promise.all(taskIds.map(taskId =>
        axios.delete(`${process.env.REACT_APP_API_URL}/NtoTask/${taskId}/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        })
    ));

    return responses.map(response => response.data);
};



