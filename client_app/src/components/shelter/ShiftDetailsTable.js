import React from "react";
import "../../styles/shelter/ShiftDetailsTable.css";
import shiftDetails from './ShiftDetailsData.tsx';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faCheck, faX, faPenToSquare} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

export const ShiftDetailsTable = props => {
  const navigate = useNavigate();
  const { onSignUpVolunteersClick , onSendEmergencyAlertClick, onStatusModalClick} = props;

  const emailButton = () => {
    return (
      <button className="emailButton" onClick={onSendEmergencyAlertClick}>
        <FontAwesomeIcon icon={faEnvelope} size="1x" className="emailIcon" />
      </button>
    )
  }

  const openStatusButton = shift => {
    return (
      <button className="openStatusButton" onClick={() => onStatusModalClick(shift)}>
        <FontAwesomeIcon icon={faCheck} size="1x" className="checkIcon" />
        Open
      </button>
    )
  }

  const closedStatusButton = shift => {
    return (
      <button className="closedStatusButton" onClick={() => onStatusModalClick(shift)}>
        <FontAwesomeIcon icon={faX} size="1x" className="xIcon" />
        Closed
      </button>
    )
  }

  const editButton = () => {
    return (
      <button className="editButton" onClick={() => navigate("/request-for-help")}>
        <FontAwesomeIcon icon={faPenToSquare} size="1x" className="xIcon" />
      </button>
    )
  }

  const viewRosterButton = () => {
    return (
      <button className="rosterButton" onClick={onSignUpVolunteersClick}>
        View Roster
      </button>
    )
  }

  return (
    <div className="shiftdetails-container">
      <table className="shiftsTable">
        <thead className="shiftsTableHeader">
          <tr>
            <td>Date</td>
            <td>Shift</td>
            <td>Coverage</td>
            <td>View Volunteers</td>
            <td>Open/Close Sign Up</td>
            <td>Edit Shift</td>
            <td>Send Emergency Alert</td>
          </tr>
        </thead>
        <tbody className="shiftsTableBody">
          {shiftDetails.data.map((shift) => (
            <tr key={shift.id}>
              <td>{shift.date}</td>
              <td>{shift.startTime + ' - ' + shift.endTime}</td>
              <td>{shift.coverage}</td>
              <td>{viewRosterButton()}</td>
              <td>{shift.status ? openStatusButton(shift) : closedStatusButton(shift)}</td>
              <td>{editButton(shift)}</td>
              <td>{emailButton()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
