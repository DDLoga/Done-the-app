import axios from 'axios';

export const deleteTasksAPI = async (taskIds) => {
    const responses = await Promise.all(taskIds.map(taskId =>
        axios.delete(`http://127.0.0.1:8000/api/NtoTask/${taskId}/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        })
    ));

    return responses.map(response => response.data);
};