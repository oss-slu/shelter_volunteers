import React, { Fragment, useState, useCallback } from "react";
import { Calendar, Views } from "react-big-calendar";
import { dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";


const localizer = dayjsLocalizer(dayjs);

export default function RequestForHelp() {
  const [myEvents, setEvents] = useState([]);

  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      const title = window.prompt('New Event name')
      if (title) {
        setEvents((prev) => [...prev, { start, end, title }])
      }
    },
    [setEvents]
  )

  const handleSelectEvent = useCallback(
    (event) => window.alert(event.title),
    []
  )

  return (
    <Fragment>
      <div className="height600">
        <Calendar
          defaultView={Views.WEEK}
          events={myEvents}
          localizer={localizer}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
        />
      </div>
    </Fragment>
  )
}

