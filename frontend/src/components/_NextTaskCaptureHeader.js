import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { TextField, Button } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fetchProjectsAPI, updateProjectAPI } from './_fetchProjects';
import PrioritySelect from './_PrioritySelect';
import StatusSelect from './_StatusSelect';
import CircularProgress from '@mui/material/CircularProgress';
import { SelectedRowsContext } from './_prioritizerSelectedRowsContext';

const NextTaskCaptureHeader = () => {
    const {                                                                 // fetch projects data
        data: fetchedProjectsData, 
        isLoading: isLoadingProjects, 
        error: errorLoadingProjects, 
        refetch
    } = useQuery('fetchedProjectsData', fetchProjectsAPI);

    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);      // project index counter

    const [project, setProject] = useState(                                 // load the current project data    
        fetchedProjectsData ? 
        fetchedProjectsData[currentProjectIndex] : null);


    useEffect(() => {                                                       // load project data when the project index changes
        if (fetchedProjectsData) {
            setProject(fetchedProjectsData[currentProjectIndex]);
        }
    }, [fetchedProjectsData, currentProjectIndex]);

    const [, setSelectedRowsContext] = React.useContext(SelectedRowsContext); //pass project ID as filter for tasks
    
    useEffect(() => {                                                        // update the project ID to pass to context    
        if (project) {
            setSelectedRowsContext([project.id]);
        }
    }, [project, setProject, setSelectedRowsContext]);

    const handleNext = () => {                                           
        setCurrentProjectIndex((prevIndex) => prevIndex + 1);
        setProject(fetchedProjectsData[currentProjectIndex]);
    };
    
    const handlePrevious = () => {                                   
        setCurrentProjectIndex((prevIndex) => prevIndex - 1);
        setProject(fetchedProjectsData[currentProjectIndex]);
    };

    const [inputValue, setInputValue] = useState('');                           // allow project text field to be editable

    useEffect(() => {                                                           // load the project name into the text field  
        if (project) {
            setInputValue(project.project_name);
        }
    }, [project]);    

    useEffect(() => {
        const handleUpdate = async () => {                                      // save to API
            try {
                await updateProjectAPI({ projectId: project.id, updatedProject: project });
                refetch();
                // handle success
            } catch (error) {
                // handle error
            }
        };
        handleUpdate();
    }, [project, refetch]);

    if (isLoadingProjects) return 'Loading...';
    if (errorLoadingProjects) return 'An error has occurred: ' + errorLoadingProjects.message;
    if (!fetchedProjectsData) return 'Loading...';

    const totalProjects = fetchedProjectsData.length;

    if (!project) {
        return <CircularProgress />;
    }

    return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <div className="flex flex-col space-y-4">
                    <div>
                        <p className="mb-12">Project <span className="font-bold text-yellow-300 text-4xl ">{currentProjectIndex + 1}</span> of <span className="font-bold text-blue-500 text-4xl">{totalProjects}</span></p>
                        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4">
                            
                            <TextField
                                label="Project Name" 
                                value={inputValue} 
                                onChange={(e) => setInputValue(e.target.value)}
                                onBlur={(e) => setProject({ ...project, project_name: inputValue })}
                            />
                            <DatePicker 
                                label="Deadline"
                                value={new Date(project.project_deadline)} 
                                onChange={(date) => setProject({ ...project, project_deadline: date.toISOString().split('T')[0] })}
                            />
                            <PrioritySelect 
                                value={project.project_priority} 
                                onChange={(e) => {
                                    setProject({ ...project, project_priority: e.target.value });
                                }}
                            />
                            <StatusSelect 
                                value={project.project_status} 
                                onChange={(e) => setProject({ ...project, project_status: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex">
                        {currentProjectIndex > 0 && <Button onClick={handlePrevious}>Previous</Button>}
                        {currentProjectIndex < totalProjects - 1 && <Button onClick={handleNext}>Next</Button>}
                    </div>
                </div>
            </LocalizationProvider>
    );
};

export default NextTaskCaptureHeader;