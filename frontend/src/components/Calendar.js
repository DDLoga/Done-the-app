import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';

import { fetchTasks } from './_fetchTasks';

function Calendar() {
    const { data: fetchedTasksData, isLoading: isLoadingTasks, error: errorLoadingTasks } = useQuery('fetchedTasksData', fetchTasks);

    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [lastDropEvent, setLastDropEvent] = useState(null);

    useEffect(() => {
        setTasks(fetchedTasksData);
    }, [fetchedTasksData]);

    useEffect(() => {
        let draggableEl = document.getElementById("external-events");
        new Draggable(draggableEl, {
            itemSelector: '.fc-event',
            eventData: function(eventEl) {
                let title = eventEl.getAttribute('title');
                let id = eventEl.getAttribute('data-id');
                return {
                    title: title,
                    id: id,
                    allDay: true
                };
            }
        });
    }, [tasks]);

    const handleDrop = ({event, draggedEl}) => {
        if (lastDropEvent === event) {
            return;
        }

        const id = draggedEl.getAttribute('data-id');
        setTasks(tasks.filter(task => task.id !== id));
        setLastDropEvent(event);
    };

    return (
        <div style={{ display: 'flex' }}>
            <div id="external-events">
                {tasks && tasks.map((task, index) => (
                    <div key={task.id} title={task.name} data-id={task.id} className="fc-event">
                        {task.name}
                    </div>
                ))}
            </div>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                droppable={true}
                events={events}
                drop={handleDrop}
                // Add more FullCalendar options here
            />
        </div>
    );
}
export default Calendar;