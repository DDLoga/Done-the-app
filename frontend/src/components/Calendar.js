import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Draggable } from '@fullcalendar/interaction';
import { fetchTasks } from './_fetchTasks';
import { fetchEvents, createEvent, updateEventAPI, deleteEventsAPI } from './_fetchEvents';
import { fetchWithToken } from './_api';
import BaseLayout from './baselayout';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { TrashIcon } from '@heroicons/react/24/solid';
import TasksTable from './_calendarTasksTable';
import EventsCalendar from './_CalendarEventsCalendar';
import CircularProgress from '@mui/material/CircularProgress';
import SyncIcon from '@mui/icons-material/Sync';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import Tooltip from '@mui/material/Tooltip';
import LinkIcon from '@mui/icons-material/Link';


function Calendar() {
    const headerContent = "Calendar";                               // set the header content    
    
    /////////////////////////////////////////////////////////////////   Manage tasks /////////////////////////////////////////////////////////////////
    const {                                                         // fetch the tasks data from the API
        data: fetchedTasksData, 
        isLoading: isLoadingTasks, 
        error: errorLoadingTasks 
    } = useQuery('fetchedTasksData', fetchTasks);

    const [tasks, setTasks] = useState([]);                         // update task dataset


    const handleTaskUpdate = (updatedTask) => {                     // update a specific in the local dataset - props from the TasksTable component
        const taskIndex = tasks.findIndex(
            task => task.id === updatedTask.id);
        const newTasks = [...tasks];
        newTasks[taskIndex] = updatedTask;
        const filteredTasks = newTasks.filter(task => task.status !== 'Cn' && task.status !== 'Co');
        setTasks(filteredTasks);
    };
    
    useEffect(() => {
        if (fetchedTasksData) {
            const filteredTasks = fetchedTasksData.filter(task => task.status !== 'Cn' && task.status !== 'Co');
            setTasks(filteredTasks);
        }
    }, [fetchedTasksData]);

    useEffect(() => {                                                   
        let draggableEl = document.getElementById("external-events");   
        if (draggableEl) {
            let draggable = new Draggable(draggableEl, {                                  
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

            return () => {
                draggable.destroy();
            };
        }
    }, [tasks]);

    ///////////////////////////////////////////////////////////////////////   Manage events /////////////////////////////////////////////////////////////////
    const {                                                         // fetch events data from the API
        data: fetchedEventsData,
        isLoading:isLoadingEventsData, 
    } = useQuery('fetchedEventsData', fetchEvents); 

    const queryClient = useQueryClient();                           // used to refetch the events data after an update
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
        const id = draggedEl.getAttribute('data-id');               // get the id of the task
        const title = draggedEl.getAttribute('data-title');              // get the title of the task   
        const duration = 60 * 60 * 1000;                            // 1 hour in milliseconds
        const end = new Date(info.date.getTime() + duration);       // calculate the end time of the event
        const userResponse = await fetchWithToken(                  // get request to get the user data
            `${process.env.REACT_APP_API_URL}/getUser/`,
            { method: 'GET' });
        const userData = await userResponse.json();                 // get the user data
        const userId = userData.id;                                 // get the user id

        const newEvent = {                                          // convert the event for the API
            event_title: title,
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

    const handleDeleteEvent = () => {
        deleteEventMutation.mutate([selectedEvent.id]);
    };

    function renderEventContent(eventInfo) {                        // add a trash icon to the event
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


/////////////////////////////////////////////////////////////////////   Google Calendar /////////////////////////////////////////////////////////////////
    const clientId = process.env.REACT_APP_CLIENT_ID;               // get the google client id from the environment
    const redirectUri = process.env.REACT_APP_REDIRECT_URI;         // get the redirect uri from the environment

    // button link to connect to google calendar
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&scope=https://www.googleapis.com/auth/calendar&redirect_uri=${redirectUri}&access_type=offline&prompt=consent`;
    const handleAuthRedirect = () => {
        window.location.href = authUrl;
    };
    



    const [isConnected, setIsConnected] = useState(false);          // confirm if the user is connected to google calendar
    const [isSyncing, setIsSyncing] = useState(false);              // confirm if the user is syncing google calendar
    const [syncStatus, setSyncStatus] = useState({
        status: '',
        created_events: 0,
        updated_events: 0,
        deleted_events: 0,
    });
    const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
    const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);


    useEffect(() => {
        if (!isUnlinkDialogOpen) { // Only run the effect if isUnlinkDialogOpen is false
            fetchWithToken(`${process.env.REACT_APP_API_URL}/getUser/`, { method: 'GET' })
                .then(response => response.json())
                .then(userData => {
                    const userId = userData.id;
                    if (userId) {
                        fetchWithToken(`${process.env.REACT_APP_API_URL}/IsConnectedToGoogleApiView?userId=${userId}`, { method: 'GET' })
                            .then(response => response.json())
                            .then(data => {
                                setIsConnected(data.is_connected);
                            })
                            .catch(error => console.error('Error:', error));
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    }, [isUnlinkDialogOpen]); // Add isUnlinkDialogOpen as a dependency
    
    const handleUnlink = () => {
        // Make a request to your Django server to remove the user's Google Calendar link
        const url = `${process.env.REACT_APP_API_URL}/unlink-google-calendar/`;
        const token = localStorage.getItem('token'); // Get the user's token

        fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            setIsUnlinkDialogOpen(true);
            setTimeout(() => {
                setIsUnlinkDialogOpen(false);
            }, 2000); // 2000 milliseconds = 2 seconds
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };
    
    const syncGoogleCalendar = () => {
        if (isConnected) {
            setIsSyncing(true);
            setIsSyncDialogOpen(true);
            fetchWithToken(`${process.env.REACT_APP_API_URL}/getUser/`, { method: 'GET' })
                .then(response => response.json())
                .then(userData => {
                    const userId = userData.id;
                    if (userId) {
                        fetchWithToken(`${process.env.REACT_APP_API_URL}/sync-google-calendar?userId=${userId}`, { method: 'GET' })
                            .then(response => response.json())
                            .then(data => {
                                setSyncStatus(data);  // Set the sync status with the response from the backend
                                setIsSyncing(false);
                                setTimeout(() => {
                                    setIsSyncDialogOpen(false);
                                }, 2000);
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                setIsSyncing(false);
                                setIsSyncDialogOpen(false);
                            });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    setIsSyncing(false);
                });
        }
    };

    useEffect(() => {                                               // trigger the sync function when the user is connected
        syncGoogleCalendar();
    }, [isConnected, queryClient]);

    useEffect(() => {                                               // refetch the events data after syncing with google calendar
        if (!isSyncing) {
            queryClient.invalidateQueries('fetchedEventsData');
        }
    }, [isSyncing, queryClient]);

    function setErrorLoadingTasks(error) {
        console.error("An error occurred while loading tasks: ", error);
    }


    return (
        <BaseLayout headerContent={headerContent}>
            {(isLoadingTasks || isLoadingEventsData) ? (
                <div className="flex items-center justify-center min-h-screen">
                    <CircularProgress />
                </div>
            ) : errorLoadingTasks ? (
                <Dialog
                    open={true}
                    onClose={() => setErrorLoadingTasks(null)}
                >
                    <DialogTitle>Error</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {'An error has occurred: ' + errorLoadingTasks.message}
                        </DialogContentText>
                    </DialogContent>    
                    <DialogActions>
                        <Button onClick={() => setErrorLoadingTasks(null)} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : (
                <div className="flex flex-col md:flex-row md:space-x-4 max-w-screen-xl mx-auto">
                    <div className="flex flex-col">
                        <div>
                            {isConnected ? (
                                <div className="flex items-center space-x-10">
                                    <Tooltip title="Connected to Google Calendar">
                                        <LinkIcon color="success" className="mx-2.5" />
                                    </Tooltip>
                                    <Tooltip title="Sync">
                                        <Button onClick={syncGoogleCalendar}>
                                            <SyncIcon />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Unlink Google Calendar">
                                        <Button onClick={handleUnlink}>
                                            <LinkOffIcon />
                                        </Button>
                                    </Tooltip>
                                </div>
                            ) : (
                                <Tooltip title="Link Your Google Calendar">
                                    <Button onClick={handleAuthRedirect}>
                                        <LinkIcon />
                                    </Button>
                                </Tooltip>
                            )}
                        </div>
                        <div>
                            <TasksTable 
                            tasks={tasks}
                            onTaskUpdate={handleTaskUpdate} />
                        </div>
                    </div>
                    <div className="flex-grow" style={{ height: '80vh', maxHeight: '100%' }}>
                        <EventsCalendar 
                            events={events} 
                            handleDrop={handleDrop} 
                            handleEventReceive={handleEventReceive} 
                            handleEventEdit={handleEventEdit} 
                            renderEventContent={renderEventContent} 
                        />
                    </div>
                </div>
            )}
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
                <Dialog open={isSyncDialogOpen}>
                    <DialogTitle>Syncing...</DialogTitle>
                    <DialogContent className="flex items-center justify-center h-24">
                    {isSyncing ? (
                        <CircularProgress />
                    ) : (
                        syncStatus && (
                            <div>
                                {/* <p>Status: {syncStatus.status}</p> */}
                                <p>Created events: {syncStatus.created_events}</p>
                                <p>Updated events: {syncStatus.updated_events}</p>
                                <p>Deleted events: {syncStatus.deleted_events}</p>
                            </div>
                        )
)}
                    </DialogContent>
                </Dialog>
                <Dialog open={isUnlinkDialogOpen}>
                    <DialogTitle>Unlinking...</DialogTitle>
                    <DialogContent className="flex items-center justify-center h-24">
                        <p>Successfully Unlinked with Google Calendar</p>
                    </DialogContent>
                </Dialog>
        </BaseLayout>
    );
    }
    export default Calendar;