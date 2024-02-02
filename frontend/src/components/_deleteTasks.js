import axios from 'axios';

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