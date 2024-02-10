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

export const fetchAssignees = async () => {
    return await apiCall('/get_assignees', 'GET');
};

export const createAssignee = async (assignee) => {
    return await apiCall('/get_assignees/', 'POST', assignee);
};

export const updateAssigneeAPI = async (assigneeId) => {
    return await apiCall(`/get_assignee/${assigneeId.assigneeId}/`, 'PUT', assigneeId.updatedAssignee);
};

export const deleteAssigneeAPI = async (assigneeId) => {
    const responses = await Promise.all(assigneeId.map(assigneeIdSingle =>
        axios.delete(`${process.env.REACT_APP_API_URL}/get_assignee/${assigneeIdSingle}/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        })
    ));

    return responses.map(response => response.data);
};