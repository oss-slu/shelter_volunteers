import React, { Component } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import "../../styles/shelter/ShiftDetailsTable.css";
import shiftDetails from './ShiftDetailsData.tsx';
class ShiftDetailsTable extends Component {
    render() {
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
