import React, { useState } from 'react';

import BaseLayout from './baselayout';
import ProjectsPrioritizer from './_prioritizerProjects';
import { SelectedRowsContext } from './_prioritizerSelectedRowsContext';    // import the SelectedRowsContext from './SelectedRowsContext'




const PrioritizerProjects = () => {

    const headerContent = "Prioritizer";

    const [selectedRowsContext, setSelectedRowsContext] = useState([]);


    return (
        <BaseLayout headerContent={headerContent}>
                <div className="flex flex-col text-white p-6 space-y-4 w-full">
                    <SelectedRowsContext.Provider value={[selectedRowsContext, setSelectedRowsContext]}>
                        <div>
                            <ProjectsPrioritizer />
                        </div>
                    </SelectedRowsContext.Provider>
                </div>
        </BaseLayout>
    );
}

export default PrioritizerProjects;