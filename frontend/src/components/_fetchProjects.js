export const fetchProjects = async () => {
    const response = await fetch('http://127.0.0.1:8000/api/get_projects', {
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