import React, { useState } from 'react';

import BaseLayout from './baselayout';
import TasksPrioritizer from './_prioritizerTasks';
import ProjectsPrioritizer from './_prioritizerProjects';
import { SelectedRowsContext } from './_prioritizerSelectedRowsContext';    // import the SelectedRowsContext from './SelectedRowsContext'
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

    const [selectedRowsContext, setSelectedRowsContext] = useState([]);


    return (
        <BaseLayout headerContent={headerContent}>
            <ThemeProvider theme={darkTheme}>
                <div className="flex flex-col text-white p-6 space-y-4 w-full">
                    <SelectedRowsContext.Provider value={[selectedRowsContext, setSelectedRowsContext]}>
                        <div>
                            <ProjectsPrioritizer />
                        </div>
                        <div>
                            <TasksPrioritizer />
                        </div>
                    </SelectedRowsContext.Provider>
                </div>
            </ThemeProvider>
        </BaseLayout>
    );
}

export default Prioritizer;