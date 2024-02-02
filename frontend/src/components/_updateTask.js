import axios from 'axios';

export const updateTaskAPI = async (taskId) => {

    const response = await axios.put(`${process.env.REACT_APP_API_URL}/NtoTask/${taskId.taskId}/`, taskId.updatedTask, {
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};