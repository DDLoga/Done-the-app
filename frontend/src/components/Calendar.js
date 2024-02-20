import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
import { useQuery } from 'react-query';
import { fetchTasks } from './_fetchTasks';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import BaseLayout from './baselayout';

const DraggableTaskRow = ({ task, handleDrop }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'task',
        item: { task },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    return (
        <tr ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <td>{task.name}</td>
            <td>{task.compound_priority}</td>
        </tr>
    );
};

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);
    const headerContent = "Calendar";

    const { data: fetchedTasksData, isLoading: isLoadingTasks, error: errorLoadingTasks } = useQuery('fetchedTasksData', fetchTasks);

    const handleDrop = (task) => {
        setCurrentTask(task);
    };

    const handleDateClick = (info) => {
        if (currentTask) {
            const newEvent = {
                title: currentTask.name,
                start: info.dateStr,
                allDay: info.allDay,
            };

            console.log('Dropped event:', newEvent); // Add this line

            setEvents(prevEvents => [...prevEvents, newEvent]);
            setCurrentTask(null);
        }
    };

    return (
        <BaseLayout headerContent={headerContent}>
            <div className="flex flex-row justify-between">
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Priority Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fetchedTasksData && fetchedTasksData.map(task => (
                                <DraggableTaskRow key={task.id} task={task} handleDrop={handleDrop} />
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="w-1/2">
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={events}
                        dateClick={handleDateClick} // Add this line
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