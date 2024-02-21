import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';

import { fetchTasks } from './_fetchTasks';
import timeGridPlugin from '@fullcalendar/timegrid';

function Calendar() {
    console.log('Calendar');
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

    const handleDrop = (info) => {
        // Stop the propagation of the drop event
        info.jsEvent.stopPropagation();
        console.log('handleDrop fired with: ', info);
        const { event } = info;
        const draggedEl = info.draggedEl;
        const id = draggedEl.getAttribute('data-id');

        if (lastDropEvent === id) {
            console.log('lastDropEvent: ', lastDropEvent);
            console.log('current id: ', id);
            console.log('we should stop here!');
            return;
        }

        console.log('setting tasks with: ', tasks);
        setTasks(tasks.filter(task => task.id !== id));
        console.log('tasks set as: ', tasks);
        console.log('setting lastDropEvent with: ', id)
        setLastDropEvent(id);
        console.log('lastDropEvent set as: ', lastDropEvent);

        // Add the event to the calendar
        setEvents([...events, {
            title: draggedEl.title,
            start: info.date,
            allDay: info.allDay
        }]);
    };

    const handleEventDrop = (info) => {
        const { event } = info;
    
        // Update the event in the events state
        setEvents(events.map((e) => {
            if (e.id === event.id) {
                return {
                    ...e,
                    start: event.start,
                    end: event.end
                };
            }
            return e;
        }));
    };
    
    const handleEventResize = (info) => {
        const { event } = info;
    
        // Update the event in the events state
        setEvents(events.map((e) => {
            if (e.id === event.id) {
                return {
                    ...e,
                    start: event.start,
                    end: event.end
                };
            }
            return e;
        }));
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
    );
}
export default Calendar;