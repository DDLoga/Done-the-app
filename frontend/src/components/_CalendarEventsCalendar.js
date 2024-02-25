import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function EventsCalendar({ events, handleDrop, handleEventReceive, handleEventEdit, renderEventContent }) {
    return (
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
            eventReceive={handleEventReceive}
            eventDrop={handleEventEdit}
            eventResize={handleEventEdit}
            eventContent={renderEventContent}
            windowResize={function(view) {
                if (window.innerWidth < 768){
                    this.setOption('headerToolbar', {
                        left: 'prev,next',
                        center: 'title',
                        right: ''
                    });
                } else {
                    this.setOption('headerToolbar', {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    });
                }
            }}
        />
    );
}

export default EventsCalendar;