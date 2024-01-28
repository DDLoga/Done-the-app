import React from 'react';

import BaseLayout from './baseLayout';
import TasksPrioritizer from './_prioritizerTasks';
import ProjectsPrioritizer from './_prioritizerProjects';

import { createTheme, ThemeProvider} from '@mui/material';



const Prioritizer = () => {
    // use dark theme for the data grid
    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });
    // set the header content to be displayed in the base layout
    const headerContent = "Prioritizer";



    return (
        <BaseLayout headerContent={headerContent}>
            <ThemeProvider theme={darkTheme}>
                <div className="flex flex-col text-white p-6 space-y-4 w-full">
                    <div>
                        <ProjectsPrioritizer />
                    </div>
                    <div>
                        <TasksPrioritizer />
                    </div>
                </div>
            </ThemeProvider>
        </BaseLayout>
    );
    }

export default Prioritizer;