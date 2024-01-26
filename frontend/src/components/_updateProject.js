import axios from 'axios';

export const updateProjectAPI = async (projectId) => {

    const response = await axios.put(`http://127.0.0.1:8000/api/NtoProject/${projectId.projectId}/`, projectId.updatedProject, {
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};