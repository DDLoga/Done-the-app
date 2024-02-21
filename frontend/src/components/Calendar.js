import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';

import { fetchTasks } from './_fetchTasks';
import timeGridPlugin from '@fullcalendar/timegrid';
import BaseLayout from './baselayout';

function Calendar() {
    const headerContent = "Calendar";
    const { data: fetchedTasksData, isLoading: isLoadingTasks, error: errorLoadingTasks } = useQuery('fetchedTasksData', fetchTasks);

    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [lastDropEvent, setLastDropEvent] = useState(null);

    useEffect(() => {
        setTasks(fetchedTasksData);
    }, [fetchedTasksData]);

    useEffect(() => {
        console.log('events', events);
    }, [events]);

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

    const handleDrop = (info) => {
        // Stop the propagation of the drop event
        info.jsEvent.stopPropagation();
        const draggedEl = info.draggedEl;
        const id = draggedEl.getAttribute('data-id');

            // Calculate the end time based on the start time and the duration of the event
        const duration = 60 * 60 * 1000; // 1 hour in milliseconds
        const end = new Date(info.date.getTime() + duration);

        if (lastDropEvent === id) {
            return;
        }

        setTasks(tasks.filter(task => task.id !== id));
        setLastDropEvent(id);


        // Add the event to the calendar
        setEvents([...events, {
            title: draggedEl.title,
            start: new Date(info.date.getTime()), // Create a new Date object for the start time
            end: new Date(end.getTime()), // Create a new Date object for the end time
            allDay: info.allDay
        }]);
    };

    const handleEventDrop = (info) => {
        const { event } = info;

        // Manually set the event's start and end times
        event.setStart(new Date(event.start.getTime()));
        event.setEnd(new Date(event.end.getTime()));

        // Update the event in the events state
        const updatedEvents = events.map((e) => {
            if (e.id === event.id) {
                return {
                    ...e,
                    start: new Date(event.start.getTime()), // Create a new Date object for the start time
                    end: new Date(event.end.getTime()) // Create a new Date object for the end time
                };
            }
            return e;
        });
        setEvents(updatedEvents);

        // Log the updated events
        console.log('Updated events:', updatedEvents);
    };

    const handleEventResize = (info) => {
        const { event } = info;

        // Manually set the event's start and end times
        event.setStart(new Date(event.start.getTime()));
        event.setEnd(new Date(event.end.getTime()));

        // Update the event in the events state
        const updatedEvents = events.map((e) => {
            if (e.id === event.id) {
                return {
                    ...e,
                    start: new Date(event.start.getTime()), // Create a new Date object for the start time
                    end: new Date(event.end.getTime()) // Create a new Date object for the end time
                };
            }
            return e;
        });
        setEvents(updatedEvents);

        // Log the updated events
        console.log('Updated events:', updatedEvents);
    };

    return (
        <BaseLayout headerContent={headerContent}>
            <div style={{ display: 'flex' }}>
                <div id="external-events">
                    {tasks && tasks.map((task, index) => (
                        <div key={task.id} title={task.name} data-id={task.id} className="fc-event">
                            {task.name}
                        </div>
                    ))}
                </div>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    droppable={true}
                    editable={true}
                    events={events}
                    drop={handleDrop}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    // Add more FullCalendar options here
                />
            </div>
        </BaseLayout>
    );
}
export default Calendar;