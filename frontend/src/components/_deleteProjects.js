import axios from 'axios';

export const deleteProjectsAPI = async (projectIds) => {
    const responses = await Promise.all(projectIds.map(projectId =>
        axios.delete(`http://127.0.0.1:8000/api/NtoProject/${projectId}/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        })
    ));

    return responses.map(response => response.data);
};