import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import BaseLayout from './baselayout';
import TasksPrioritizer from './_prioritizerTasks';
import { SelectedRowsContext } from './_prioritizerSelectedRowsContext';
import './_BigCalendarDarkTheme.css';
import { useDrag, useDrop } from 'react-dnd';

const localizer = momentLocalizer(moment);


const DraggableTasksPrioritizer = ({ columns }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'task', // 'task' is the type of the draggable item
        item: { columns },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    return (
        <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <TasksPrioritizer columns={columns} />
        </div>
    );
};

const Calendar = () => {
    const [events, setEvents] = useState([]); // Initialize events state
    const [selectedRowsContext, setSelectedRowsContext] = useState([]);
    const headerContent = "Calendar";
    const columns = ['Name', 'Priority Score', 'Effort'];

    const onDrop = (item) => {
        // Convert the task to an event
        const event = {
            title: item.columns[0], // Replace with the task properties in your data
            start: new Date(), // Set start time to now
            end: new Date(), // Set end time to now
        };

        // Add the new event to the events state
        setEvents(prevEvents => [...prevEvents, event]);
    };

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: 'task',
        drop: onDrop,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    return (
        <BaseLayout headerContent={headerContent}>
            <div className="flex flex-row justify-between">
                <div>
                    <SelectedRowsContext.Provider value={[selectedRowsContext, setSelectedRowsContext]}>
                        <DraggableTasksPrioritizer columns={columns} />
                    </SelectedRowsContext.Provider>
                </div>
                <div className="w-1/2" ref={drop}>
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

const App = () => (
    <DndProvider backend={HTML5Backend}>
        <Calendar />
    </DndProvider>
);

export default App;