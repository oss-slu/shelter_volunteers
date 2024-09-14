import React, { Component } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import "../../styles/index.css";

class ShiftDetailsTable extends Component {
    render() {
        const shiftDetails = {
            data: [
              {
                id: 1,
                startTime: "12:00 PM",
                numVolunteersSignedUp: 5,
                numVolunteersNeeded: 15,
              },
              {
                id: 2,
                startTime: "12:30 PM",
                numVolunteersSignedUp: 6,
                numVolunteersNeeded: 17,
              },
              {
                id: 3,
                startTime: "1:00 PM",
                numVolunteersSignedUp: 8,
                numVolunteersNeeded: 30,
              },
              {
                id: 4,
                startTime: "1:30 PM",
                numVolunteersSignedUp: 15,
                numVolunteersNeeded: 40,
              },
              {
                id: 5,
                startTime: "2:00 PM",
                numVolunteersSignedUp: 35,
                numVolunteersNeeded: 50,
              },
              {
                id: 6,
                startTime: "2:30 PM",
                numVolunteersSignedUp: 25,
                numVolunteersNeeded: 30,
              },
              {
                id: 7,
                startTime: "3:00 PM",
                numVolunteersSignedUp: 12,
                numVolunteersNeeded: 20,
              },
              {
                id: 8,
                startTime: "3:30 PM",
                numVolunteersSignedUp: 4,
                numVolunteersNeeded: 12,
              },
            ],
        };
        return (
          <div className="shiftdetails-container">
            {shiftDetails.data.map((shift) => (
              <Row className="shiftdetails-row text-color-start-time" key={shift.id}>
                <Col className="shiftdetails-col" xs={2} style={{ fontWeight: "bold" }}>{shift.startTime}</Col>
                <Col className="shiftdetails-col" xs={4}>Signed Up Volunteers: {shift.numVolunteersSignedUp}</Col>
                <Col className="shiftdetails-col" xs={4}>Requested Volunteers: {shift.numVolunteersNeeded}</Col>
                <Col xs={2}>
                  <button className="moredetails-button">More Details</button>
                </Col>
              </Row>
            ))}
          </div>
        );
    }
}
export default ShiftDetailsTable;
