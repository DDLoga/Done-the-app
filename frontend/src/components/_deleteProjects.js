import axios from 'axios';

export const deleteProjectsAPI = async (projectIds) => {
    const responses = await Promise.all(projectIds.map(projectId =>
        axios.delete(`${process.env.REACT_APP_API_URL}/NtoProject/${projectId}/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        })
    ));

    return responses.map(response => response.data);
};