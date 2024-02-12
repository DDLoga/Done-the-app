import React, { useState } from 'react';

import BaseLayout from './baselayout';
import TasksPrioritizer from './_prioritizerTasks';
import NextTaskCaptureHeader from './_NextTaskCaptureHeader';
import { SelectedRowsContext } from './_prioritizerSelectedRowsContext';    // import the SelectedRowsContext from './SelectedRowsContext'




const Prioritizer = () => {

    const headerContent = "Next Task Capture";

    const [selectedRowsContext, setSelectedRowsContext] = useState([]);


    return (
        <BaseLayout headerContent={headerContent}>
                <div className="flex flex-col text-white p-6 space-y-4 w-full">
                    <SelectedRowsContext.Provider value={[selectedRowsContext, setSelectedRowsContext]}>
                        <div>
                            <NextTaskCaptureHeader />
                        </div>
                        <div>
                            <TasksPrioritizer />
                        </div>
                    </SelectedRowsContext.Provider>
                </div>
        </BaseLayout>
    );
}

export default Prioritizer;