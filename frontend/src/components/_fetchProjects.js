import axios from 'axios';

export const fetchProjectsAPI = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/get_projects`, {
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

export const updateProjectAPI = async (projectId) => {
    const response = await axios.put(`${process.env.REACT_APP_API_URL}/NtoProject/${projectId.projectId}/`, projectId.updatedProject, {
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};

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