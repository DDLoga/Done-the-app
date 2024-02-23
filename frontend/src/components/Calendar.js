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
                title: event.event_title,
                start: event.event_start,
                end: event.event_end,
                allDay: event.event_allDay,
                id: event.id
            }));
            setEvents(formattedEvents);
        }
    }, [fetchedEventsData]);

    useEffect(() => {                                               // update the events dataset once the events are updated
        console.log('Events updated: ', events);
    }, [events]);

    const createEventMutation = useMutation(createEvent, {
        onSuccess: (data) => {
            console.log('Event created successfully', data);
            const newEvent = {
                title: data.event_title,
                start: data.event_start,
                end: data.event_end,
                allDay: data.event_allDay,
                id: data.id
            };
            setEvents((prevEventsData) => [...prevEventsData, newEvent]);
            console.log('Events now: ', events);
        },
    });

/////////////////////////////////////////////////////////////////////   Handle events /////////////////////////////////////////////////////////////////
    const handleDrop = async (info) => {
        
        info.jsEvent.stopPropagation();                 // Stop the propagation of the drop event
        const draggedEl = info.draggedEl;
        const id = draggedEl.getAttribute('data-id');
        const duration = 60 * 60 * 1000; // 1 hour in milliseconds
        const end = new Date(info.date.getTime() + duration);
        const userResponse = await fetchWithToken(`${process.env.REACT_APP_API_URL}/getUser/`, { method: 'GET' });
        const userData = await userResponse.json();
        const userId = userData.id;

        const newEvent = {
            event_title: draggedEl.title,
            event_start: new Date(info.date.getTime()), // Create a new Date object for the start time
            event_end: new Date(end.getTime()), // Create a new Date object for the end time
            event_allDay: info.allDay,
            user: userId,
            event_taskId: id
        };

        console.log('new event is: ', newEvent);

        createEventMutation.mutate(newEvent);



        // Add the event to the calendar
        // setEvents([...events, {
        //     title: draggedEl.title,
        //     start: new Date(info.date.getTime()), // Create a new Date object for the start time
        //     end: new Date(end.getTime()), // Create a new Date object for the end time
        //     allDay: info.allDay
        // }]);
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
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    // Add more FullCalendar options here
                />
            </div>
        </BaseLayout>
    );
}
export default Calendar;