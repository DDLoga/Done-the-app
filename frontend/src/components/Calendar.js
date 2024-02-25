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
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { TrashIcon } from '@heroicons/react/24/solid';
import TasksTable from './_calendarTasksTable';
import EventsCalendar from './_CalendarEventsCalendar';


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

    const [events, setEvents] = useState([]);                       // update events dataset function

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

    const createEventMutation = useMutation(createEvent, {          // send the event to the API
        onSuccess: (data) => {
            const newEvent = {                                          // convert the event the local dataset
                title: data.event_title,
                start: data.event_start,
                end: data.event_end,
                allDay: data.event_allDay,
                id: data.id,
                taskId: data.event_taskId,
            };
            console.log('New event retrieved from api: ', newEvent);
            setEvents((prevEventsData) => [...prevEventsData, newEvent]);   // update the events dataset
        },
    });

    const updateEventMutation = useMutation(updateEventAPI, {       // update the event in the API
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

    const [selectedEvent, setSelectedEvent] = useState(null);       // set the selected event to be deleted

    const deleteEventMutation = useMutation(deleteEventsAPI, {      // delete the event from the API
        onSuccess: () => {
            setEvents((prevEventsData) => prevEventsData.filter(event => event.id !== Number(selectedEvent.id)));
            setSelectedEvent(null);
        },
    });
    

/////////////////////////////////////////////////////////////////////   Handle events /////////////////////////////////////////////////////////////////
    const handleDrop = async (info) => {
        const draggedEl = info.draggedEl;                           // get the dragged element
        console.log('Dropped event: ', draggedEl);
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
        console.log('New event dropped sending to API: ', newEvent);
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
        console.log('Updated event: ', updatedEvent);
        updateEventMutation.mutate({ eventId: event.id, updatedEvent: updatedEvent });
    };

    const handleDeleteEvent = () => {
        deleteEventMutation.mutate([selectedEvent.id]);
    };

    function renderEventContent(eventInfo) {
        return (
            <>
                <b>{eventInfo.event.title}</b>
                <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700 absolute top-0 right-0 cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(eventInfo.event);
                }} />
            </>
        );
    }

    return (
        <BaseLayout headerContent={headerContent}>
            <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="w-full md:w-3/10">
                    <TasksTable tasks={tasks} />
                </div>
                <div className="w-full md:w-7/10">
                    <EventsCalendar 
                        events={events} 
                        handleDrop={handleDrop} 
                        handleEventReceive={handleEventReceive} 
                        handleEventEdit={handleEventEdit} 
                        renderEventContent={renderEventContent} 
                    />
                </div>
            </div>
            {selectedEvent && (
                <Dialog
                    open={true}
                    onClose={() => setSelectedEvent(null)}
                >
                    <DialogTitle>Delete Event</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this event?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSelectedEvent(null)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteEvent} color="primary" autoFocus>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </BaseLayout>
    );
}
export default Calendar;