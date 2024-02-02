export const fetchProjects = async () => {
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