import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import React, { Component } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dayjsLocalizer(dayjs);

class RequestForHelp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [
        {
          start: dayjs().toDate(),
          end: dayjs().add(1, "day").toDate(),
          title: "Some title",
        },
      ],
    };
  }

  render() {
    return (
      <div>
        <Calendar
          localizer={localizer}
          defaultDate={new Date()}
          defaultView="month"
          events={this.state.events}
          style={{ height: "100vh" }}
        />
      </div>
    );
  }
}

export default RequestForHelp;
