import React, { Fragment, useState, useCallback } from "react";
import { Calendar, Views } from "react-big-calendar";
import { dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal, Button, Form } from "react-bootstrap";

const localizer = dayjsLocalizer(dayjs);

export default function RequestForHelp() {
  const [myEvents, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", start: null, end: null, volunteersRequired: ""});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [volunteerError, setVolunteerError] = useState("");

  const handleSelectSlot = useCallback(({ start, end }) => {
    setNewEvent({ ...newEvent, title: "", start, end, volunteersRequired: "" })
    setSelectedEvent(null)
    setVolunteerError("")
    setShowModal(true)
  }, [])


  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event)
    setVolunteerError("")
    setNewEvent(event)
    setShowModal(true)
  }, [])

  const handleSaveEvent = () => {
    if (newEvent.volunteersRequired) {
      const volunteersRegex = /\s\(Volunteers:\s\d+\)$/;
      const volunteersText = ` (Volunteers: ${newEvent.volunteersRequired})`;
      const formattedEvent = {
        ...newEvent,
        title: selectedEvent
          ? newEvent.title.replace(volunteersRegex, "") + volunteersText 
          : newEvent.title + volunteersText,
      };

      if (selectedEvent) {
        setEvents((prev) =>
          prev.map((ev) =>
            ev.start === selectedEvent.start && ev.end === selectedEvent.end
              ? {
                  ...formattedEvent,
                  title: formattedEvent.title,
                }
              : ev
          )
        );
     } else {
        setEvents((prev) => [...prev, formattedEvent])
      }
      setVolunteerError("");
      setShowModal(false)
    } else {
      setVolunteerError("'Number of Volunteers Required' field is required.");
      return;
    }
  }

  const handleDeleteEvent = () => {
    setEvents((prev) =>
      prev.filter(
        (ev) => ev.start !== selectedEvent.start || ev.end !== selectedEvent.end
      )
    )
    setShowModal(false)
  }

  const handleVolunteerInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "volunteersRequired") {
      const volunteersValue = Math.max(0, parseInt(value) || "");
      setNewEvent((prev) => ({
        ...prev,
        volunteersRequired: volunteersValue,
      }));
    }
  
    if (name === "start" || name === "end") {
      setNewEvent((prev) => {
        const current = prev[name] ? dayjs(prev[name]) : dayjs(); 
        const [hour, minute] = value.split(":");
  
        const updatedDate = current
          .hour(parseInt(hour, 10))
          .minute(parseInt(minute, 10))
          .second(0)
          .millisecond(0);
  
        return {
          ...prev,
          [name]: updatedDate.toDate(),
        };
      });
    }
  };

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
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent ? "Edit Shift" : "Add New Shift"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Shift Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter shift name"
                value={newEvent.title || ""}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value || ""})
                }
              />
              <Form.Label>Start Time:</Form.Label>
              <Form.Control
                type="time"
                name="start"
                value={newEvent.start ? dayjs(newEvent.start).format("HH:mm") : ""}
                onChange={(e) => handleVolunteerInputChange({
                  target: { name: "start", value: e.target.value }
                })}
              />
              <Form.Label>End Time:</Form.Label>
              <Form.Control
                type="time"
                name="end"
                value={newEvent.end ? dayjs(newEvent.end).format("HH:mm") : ""}
                onChange={(e) => handleVolunteerInputChange({
                  target: { name: "end", value: e.target.value }
                })}
              />
              <Form.Label>Number of Volunteers Required</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="number"
                  name="volunteersRequired"
                  min="1"
                  value={newEvent.volunteersRequired}
                  onChange={handleVolunteerInputChange}
                  className="mx-2"
                  style={{ width: "80px" }}
                />
              </div>
              {volunteerError && <p style={{ color: 'red' }}>{volunteerError}</p>}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {selectedEvent && (
            <Button variant="danger" onClick={handleDeleteEvent}>
              Delete Shift
            </Button>
          )}
          <Button variant="primary" onClick={handleSaveEvent}>
            {selectedEvent ? "Save Changes" : "Submit Shift"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}
