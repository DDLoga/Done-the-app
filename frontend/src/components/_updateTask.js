import axios from 'axios';

export const updateTaskAPI = async (taskId) => {

    const response = await axios.put(`http://127.0.0.1:8000/api/NtoTask/${taskId.taskId}/`, taskId.updatedTask, {
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};