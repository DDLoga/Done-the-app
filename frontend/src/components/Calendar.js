import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { fetchTasks } from './_fetchTasks';

function Calendar() {
    const { data: fetchedTasksData, isLoading: isLoadingTasks, error: errorLoadingTasks } = useQuery('fetchedTasksData', fetchTasks);

    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    useEffect(() => {
        setTasks(fetchedTasksData);
    }, [fetchedTasksData]);

    const onDragEnd = (result) => {
        console.log('drag end fired', result);
        const { destination, source, draggableId } = result;

        // If there's no destination (i.e., the user cancelled the drag), do nothing
        if (!destination) {
            return;
        }

        // If the source and destination are the same, do nothing
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        function mapDroppableIdToDate(droppableId) {
            // Assume droppableId is a string in the format 'day-YYYY-MM-DD'
            const dateStr = droppableId.split('-').slice(1).join('-');
            return new Date(dateStr);
        }
        // Find the task that was dragged
        const task = fetchedTasksData.find((task) => task.id === draggableId);

        // Update the task's date based on where it was dropped
        // This will depend on how your FullCalendar component is set up
        // For example, you might have a mapping from droppableId to date
        const newDate = mapDroppableIdToDate(destination.droppableId);
        task.date = newDate;

        // Update the state with the new task list
        setTasks((currentTasks) => {
            return currentTasks.map((task) => {
                if (task.id === draggableId) {
                    return { ...task, date: newDate };
                } else {
                    return task;
                }
            });
        });
    };

    if (isLoadingTasks) return 'Loading...';
    if (errorLoadingTasks) return 'An error occurred.';

    console.log(tasks);
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: 'flex' }}>
                <table>
                    <tbody>
                        {tasks && tasks.map((task, index) => (
                            <Droppable key={task.id.toString()} droppableId={task.id.toString()}>
                                {(provided) => (
                                    <tr ref={provided.innerRef} {...provided.droppableProps}>
                                        <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                                            {(providedDraggable) => (
                                                <React.Fragment>
                                                    <td ref={providedDraggable.innerRef} {...providedDraggable.draggableProps} {...providedDraggable.dragHandleProps} data-id={task.id} data-title={task.name}>{task.name}</td>
                                                    <td>{task.compound_priority}</td>
                                                </React.Fragment>
                                            )}
                                        </Draggable>
                                        {provided.placeholder}
                                    </tr>
                                )}
                            </Droppable>
                        ))}
                    </tbody>
                </table>
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    droppable={true}
                    drop={function(info) {
                        let newEvent = {
                            id: info.draggedEl.getAttribute('data-id'),
                            title: info.draggedEl.getAttribute('data-title'),
                            start: info.date,
                            allDay: info.allDay
                        };
                        console.log('drop fired', newEvent);
                        setEvents([...events, newEvent]);
                        setTasks(tasks.filter(task => task.id !== newEvent.id));
                    }}
                    // Add more FullCalendar options here
                />
            </div>
        </DragDropContext>
    );
}
export default Calendar;