import React, { useState, useEffect } from 'react';
import { useQuery, useMutation  } from 'react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { fetchTasks } from './_fetchTasks';
import { fetchEvents, createEvent, updateEventAPI, deleteEventsAPI } from './_fetchEvents';
import { fetchWithToken } from './_api';
import timeGridPlugin from '@fullcalendar/timegrid';
import BaseLayout from './baselayout';


function Calendar() {
    const headerContent = "Calendar";                               // set the header content    
    
    /////////////////////////////////////////////////////////////////   Manage tasks /////////////////////////////////////////////////////////////////
    const {                                                         // fetch the tasks data from the API
        data: fetchedTasksData, 
        isLoading: isLoadingTasks, 
        error: errorLoadingTasks 
    } = useQuery('fetchedTasksData', fetchTasks);

    const [tasks, setTasks] = useState([]);                         // update task dataset
    
    useEffect(() => {                                               // load task dataset once fetched
        setTasks(fetchedTasksData);
    }, [fetchedTasksData]);

    useEffect(() => {                                                   // make the tasks as draggable table rows
        let draggableEl = document.getElementById("external-events");   // create a table with Draggable rows rendered on JSX
        let draggable = new Draggable(draggableEl, {                                    
            itemSelector: '.fc-event',
            eventData: function(eventEl) {                              // create an event object for the calendar
                let title = eventEl.getAttribute('title');              // get the title of the task    
                let id = eventEl.getAttribute('data-id');               // get the id of the task
                return {
                    title: title,
                    id: id,
                    allDay: true
                };
            }
        });

        return () => {
            draggable.destroy();
        };
    }, [tasks]);


    ///////////////////////////////////////////////////////////////////////   Manage events /////////////////////////////////////////////////////////////////
    const {                                                         // fetch events data from the API
        data: fetchedEventsData,
        isLoading:isLoadingContexts, 
        error:errorLoadingContexts 
    } = useQuery('fetchedEventsData', fetchEvents); 

    const [events, setEvents] = useState([]);                       // update events dataset

    useEffect(() => {                                               // load events dataset once fetched
        if (fetchedEventsData) {
            const formattedEvents = fetchedEventsData.map(event => ({
                id: event.id,
                title: event.event_title,
                start: event.event_start,
                end: event.event_end,
                allDay: event.event_allDay,
                taskId: event.event_taskId,
            }));
            setEvents(formattedEvents);
        }
    }, [fetchedEventsData]);

    // useEffect(() => {                                               // update the events dataset once the events are updated
    //     console.log('Events updated: ', events);
    // }, [events]);

    const createEventMutation = useMutation(createEvent, {              // send the event to the API
        onSuccess: (data) => {
            const newEvent = {                                          // convert the event the local dataset
                title: data.event_title,
                start: data.event_start,
                end: data.event_end,
                allDay: data.event_allDay,
                id: data.id
            };
            setEvents((prevEventsData) => [...prevEventsData, newEvent]);   // update the events dataset
        },
    });

    const updateEventMutation = useMutation(updateEventAPI, {
        onSuccess: (data) => {
            const updatedEvent = {
                title: data.event_title,
                start: data.event_start,
                end: data.event_end,
                allDay: data.event_allDay,
                id: data.id,
                taskId: data.event_taskId,
            };
            setEvents((prevEventsData) => prevEventsData.map(event => event.id === data.id ? updatedEvent : event));
        },
    });

/////////////////////////////////////////////////////////////////////   Handle events /////////////////////////////////////////////////////////////////
    const handleDrop = async (info) => {
        const draggedEl = info.draggedEl;                           // get the dragged element
        const id = draggedEl.getAttribute('data-id');               // get the id of the task
        const duration = 60 * 60 * 1000;                            // 1 hour in milliseconds
        const end = new Date(info.date.getTime() + duration);       // calculate the end time of the event
        const userResponse = await fetchWithToken(                  // get request to get the user data
            `${process.env.REACT_APP_API_URL}/getUser/`,
            { method: 'GET' });
        const userData = await userResponse.json();                 // get the user data
        const userId = userData.id;                                 // get the user id

        const newEvent = {                                          // convert the event for the API
            event_title: draggedEl.title,
            event_start: new Date(info.date.getTime()), 
            event_end: new Date(end.getTime()),
            event_allDay: info.allDay,
            user: userId,
            event_taskId: id
        };

        createEventMutation.mutate(newEvent);                       // send the event to the API
    };

    const handleEventReceive = (info) => {                          // used to avoid duplicated item on calendar on drop
        info.revert();
    };

    const handleEventEdit = async (info) => {
        const { event } = info;
        let newStart = info.event.start;
        let newEnd = info.event.end;

        newStart = newStart.toISOString().slice(0, -5) + 'Z';

        if (newEnd === null) {
            const newEndDate = new Date(newStart);
            newEndDate.setHours(newEndDate.getHours() + 1);
            newEnd = newEndDate.toISOString().slice(0, -5) + 'Z';
        } else {
            newEnd = newEnd.toISOString().slice(0, -5) + 'Z';
        }

        const userResponse = await fetchWithToken(                  // get request to get the user data
        `${process.env.REACT_APP_API_URL}/getUser/`,
        { method: 'GET' });
        const userData = await userResponse.json();                 // get the user data
        const userId = userData.id;                                 // get the user id

        const updatedEvent = {
            id: event.id,
            event_title: event.title,
            event_start: newStart,
            event_end: newEnd,
            event_allDay: info.event.allDay,
            user: userId, // You need to provide the user id here
            event_taskId: info.event.extendedProps.taskId,
            // You need to provide the task id here
        };
        updateEventMutation.mutate({ eventId: event.id, updatedEvent: updatedEvent });
    };


    return (
        <BaseLayout headerContent={headerContent}>
            <div style={{ display: 'flex' }}>
                <table id="external-events" className="bg-gray-800 text-white my-4 rounded shadow-lg w-full">
                    <thead>
                        <tr>
                            <th className="border-gray-700 border p-2">Task Name</th>
                            <th className="border-gray-700 border p-2">Compound Priority</th>
                            <th className="border-gray-700 border p-2">Deadline</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks && [...tasks].sort((a, b) => b.compound_priority - a.compound_priority).map((task, index) => (
                            <tr key={task.id} title={task.name} data-id={task.id} className="fc-event draggable bg-gray-700 hover:bg-gray-600 cursor-move" draggable="true">
                                <td className="border-gray-700 border p-2">{task.name}</td>
                                <td className="border-gray-700 border p-2">{task.compound_priority}</td>
                                <td className="border-gray-700 border p-2">{task.deadline}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    droppable={true}
                    editable={true}
                    eventSources={[{ events }]}
                    drop={handleDrop}
                    eventReceive={handleEventReceive} // Add this line
                    eventDrop={handleEventEdit}
                    eventResize={handleEventEdit}
                    // Add more FullCalendar options here
                />
            </div>
        </BaseLayout>
    );
}
export default Calendar;