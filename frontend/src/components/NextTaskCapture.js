import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { TextField, Select, Button } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fetchProjectsAPI, updateProjectAPI } from './_fetchProjects';
import PrioritySelect from './_PrioritySelect';
import StatusSelect from './_StatusSelect';
import BaseLayout from './baselayout';
import CircularProgress from '@mui/material/CircularProgress';
import TasksPrioritizer from './_prioritizerTasks'; // Import TasksPrioritizer

const NextTaskCapture = () => {
    const { 
        data: fetchedProjectsData, 
        isLoading: isLoadingProjects, 
        error: errorLoadingProjects, 
        refetch
    } = useQuery('fetchedProjectsData', fetchProjectsAPI);
    console.log(fetchedProjectsData);
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
    const [project, setProject] = useState(fetchedProjectsData ? fetchedProjectsData[currentProjectIndex] : null);
    useEffect(() => {
        if (fetchedProjectsData) {
            setProject(fetchedProjectsData[currentProjectIndex]);
        }
    }, [fetchedProjectsData, currentProjectIndex]);

    const handleNext = async () => {
        await handleUpdate();
        setCurrentProjectIndex((prevIndex) => prevIndex + 1);
        setProject(fetchedProjectsData[currentProjectIndex]);
    };

    const handlePrevious = async () => {
        await handleUpdate();
        setCurrentProjectIndex((prevIndex) => prevIndex - 1);
        setProject(fetchedProjectsData[currentProjectIndex]);
    };

    const handleUpdate = async () => {
        try {
            await updateProjectAPI({ projectId: project.id, updatedProject: project });
            refetch();
            // handle success
        } catch (error) {
            // handle error
        }
    };

    if (isLoadingProjects) return 'Loading...';
    if (errorLoadingProjects) return 'An error has occurred: ' + errorLoadingProjects.message;
    if (!fetchedProjectsData) return 'Loading...'; // Add this line

    const totalProjects = fetchedProjectsData.length;

    if (!project) {
        return <CircularProgress />;
    }

    return (
        <BaseLayout>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <div>
                    <p>Project {currentProjectIndex + 1} of {totalProjects}</p>
                    <TextField
                        label="Project Name" 
                        value={project.project_name} 
                        onChange={(e) => setProject({ ...project, project_name: e.target.value })} />
                    <DatePicker 
                        label="Deadline"
                        value={new Date(project.project_deadline)} 
                        onChange={(date) => setProject({ ...project, project_deadline: date.toISOString().split('T')[0] })} 
                    />
                    <PrioritySelect 
                        value={project.project_priority} 
                        onChange={(e) => setProject({ ...project, project_priority: e.target.value })} 
                    />
                    <StatusSelect 
                        value={project.project_status} 
                        onChange={(e) => setProject({ ...project, project_status: e.target.value })} />
                    <Button onClick={handlePrevious}>Previous</Button>
                    <Button onClick={handleNext}>Next</Button>
                </div>
                {/* <TasksPrioritizer projectId={project.id} /> */}
            </LocalizationProvider>
        </BaseLayout>
    );
};

export default NextTaskCapture;