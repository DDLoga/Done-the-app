// frontend/src/components/HandleProcessNext.js

// import { useEffect } from 'react';

export const PostTasksNProjects = ({ taskType, currentTask, effort, priority, deadline, context, relatedProject, nextAction, onPostComplete }) => {
    const handleProcessNext = async () => {
        const fetchWithToken = (url, options) => fetch(url, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
        const userResponse = await fetchWithToken('http://127.0.0.1:8000/api/getUser/', { method: 'GET' });
        const userData = await userResponse.json();
        const userId = userData.id;

        const url = taskType === 'task' ? 'http://127.0.0.1:8000/api/NtoTask/' : 'http://127.0.0.1:8000/api/NtoProject/';
        const body = taskType === 'task' ? {
            name: currentTask.name,
            user: userId,
            effort: effort,
            id: currentTask.id,
            priority: priority,
            deadline: deadline,
            context: context,
            parent: relatedProject,
            new_task: false,
        } : {
            project_name: currentTask.name,
            user: userId,
            project_priority: priority,
            project_deadline: deadline,
        };

        fetchWithToken(url, { method: 'POST', body: JSON.stringify(body) })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (taskType === 'project' && nextAction !== '') {
                    fetchWithToken('http://127.0.0.1:8000/api/quickTask/', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: nextAction,
                            user: userId,
                            parent: data.project_id,
                        }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        onPostComplete(); // Call the onPostComplete function after the post request is completed
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                } else {
                    onPostComplete(); // Call the onPostComplete function if there's no nextAction
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        };

        // useEffect(() => {
        //     // eslint-disable-next-line react-hooks/exhaustive-deps
        //     handleProcessNext();
        // }, [taskType, currentTask, effort, priority, deadline, context, relatedProject, nextAction, onPostComplete]);
    
        return null; // this component doesn't render anything
    };