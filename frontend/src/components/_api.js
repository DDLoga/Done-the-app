// src/api.js used to identify user before posting data to the server

export const fetchWithToken = (url, options) => fetch(url, {
    headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        ...options.headers,
    },
    ...options,
});