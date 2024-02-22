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

export const fetchEvents = async () => {
    return await apiCall('/get_calendars', 'GET');
};

export const updateEventAPI = async (eventId) => {
    return await apiCall(`/get_calendar/${eventId.eventId}/`, 'PUT', eventId.updatedEvent);
};

export const createEvent = async (event) => {
    return await apiCall('/get_calendars/', 'POST', event);
};

export const deleteEventsAPI = async (eventIds) => {
    const responses = await Promise.all(eventIds.map(eventId =>
        axios.delete(`${process.env.REACT_APP_API_URL}/get_calendar/${eventId}/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        })
    ));

    return responses.map(response => response.data);
};