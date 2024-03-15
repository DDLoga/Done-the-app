import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OAuth2Callback() {
    const [hasRequested, setHasRequested] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (hasRequested) {
            return;
        }

        // Extract the 'code' from the URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        // Get the Django authentication token
        // This assumes that you're storing the token in localStorage
        // Replace this with wherever you're storing the token
        const token = localStorage.getItem('token');

        // Make a request to your Django server with the 'code' and the Django authentication token
        const url = `${process.env.REACT_APP_API_URL}/oauth2callback/?code=${code}`;

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
            navigate('/calendar');
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }, [hasRequested, navigate]);

    return null;
}

export default OAuth2Callback;