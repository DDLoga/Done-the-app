import React, { useEffect, useState } from 'react';

function OAuth2Callback() {
    const [hasRequested, setHasRequested] = useState(false);

    useEffect(() => {
        if (hasRequested) {
            return;
        }

        console.log('useEffect triggered');

        // Extract the 'code' from the URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log('code:', code);

        // Get the Django authentication token
        // This assumes that you're storing the token in localStorage
        // Replace this with wherever you're storing the token
        const token = localStorage.getItem('token');
        console.log('token:', token);

        // Make a request to your Django server with the 'code' and the Django authentication token
        const url = `http://localhost:8000/api/oauth2callback/?code=${code}`; // replace with your Django server URL
        console.log('url:', url);

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            console.log('response:', response);
            return response.json();
        })
        .then(data => {
            console.log('data:', data);
            setHasRequested(true);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }, [hasRequested]);

    return <div>OAuth2 Callback</div>;
}

export default OAuth2Callback;