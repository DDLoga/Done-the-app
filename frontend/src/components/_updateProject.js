import axios from 'axios';

export const updateProjectAPI = async (projectId) => {

    const response = await axios.put(`${process.env.REACT_APP_API_URL}/NtoProject/${projectId.projectId}/`, projectId.updatedProject, {
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};