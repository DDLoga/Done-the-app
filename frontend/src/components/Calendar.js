import React, { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import BaseLayout from './baselayout';
import TasksPrioritizer from './_prioritizerTasks';
import NextTaskCaptureHeader from './_NextTaskCaptureHeader';
import { SelectedRowsContext } from './_prioritizerSelectedRowsContext';   

const localizer = momentLocalizer(moment);

const Calendar = () => {
    const events = []; // You can replace this with your events data
    const [selectedRowsContext, setSelectedRowsContext] = useState([]);
    const headerContent = "Calendar";
    const columns = ['Name', 'Compound Priority'];
    return (
        <BaseLayout headerContent={headerContent}>
        <div className="flex flex-row justify-between">
                <div className="flex flex-col text-white p-6 space-y-4 w-full">
                    <SelectedRowsContext.Provider value={[selectedRowsContext, setSelectedRowsContext]}>
                        {/* <div>
                            <NextTaskCaptureHeader />
                        </div> */}
                        <div>
                            <TasksPrioritizer columns={columns} />
                        </div>
                    </SelectedRowsContext.Provider>
                </div>
            <div className="w-1/2">
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                />
            </div>
        </div>
        </BaseLayout>
    );
};

export default Calendar;