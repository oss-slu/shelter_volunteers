import React, {useEffect, useState} from "react";
import "../../styles/shelter/ShiftDetailsTable.css";
import { shiftDetailsData } from './ShiftDetailsData.tsx';
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faCheck, faX, faPenToSquare, faTriangleExclamation} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { shiftDetailsAlwaysShowCols,  shiftDetailsColumnsToRender} from "./ShelterConstants.tsx";

export const ShiftDetailsTable = props => {
  const navigate = useNavigate();
  const { 
    onSignUpVolunteersClick , 
    onSendVolunteerMessageClick, 
    onStatusModalClick,
    stickyHeader,
    headerZIndex,
    } = props;
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 430);
  const [areColsExpanded, setAreColsExpanded] = useState(false);
  const colsToRender = (isMobileView && !areColsExpanded) ? shiftDetailsAlwaysShowCols : shiftDetailsColumnsToRender;
  let prevStartDate = "0/0/0000";

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 430);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const emailButton = () => {
    return (
      <button className="emailButton" onClick={onSendVolunteerMessageClick}>
        <FontAwesomeIcon icon={faEnvelope} size="2x" className="emailIcon" />
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
        <FontAwesomeIcon icon={faX} size="1x" className="closedIcon" />
        Closed
      </button>
    )
  }

  const editButton = () => {
    return (
      <button className="editButton" onClick={() => navigate("/request-for-help")}>
        <FontAwesomeIcon icon={faPenToSquare} size="2x" className="editIcon" />
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

  const renderCoverage = shift => {
    const text = shift.currentSignedUpVolunteers + "/" + shift.desiredVolunteers;
    if (shift.currentSignedUpVolunteers < shift.requiredVolunteers) {
      const volunteerDifference = shift.requiredVolunteers - shift.currentSignedUpVolunteers
      let volunteerPlural = ""
      if (volunteerDifference > 1) {
        volunteerPlural = "volunteers"
      } else {
        volunteerPlural = "volunteer"
      }
      const warning = volunteerDifference + " more " + volunteerPlural + " needed."
      return (
        <span className="nowrap">
          <p className="inline-text">{text}</p>
          <Tooltip
            title={warning}
            arrow
            followCursor
            enterTouchDelay={0}
            leaveTouchDelay={5001}>
            <IconButton>
              <FontAwesomeIcon icon={faTriangleExclamation} className="warningIcon" />
            </IconButton>
          </Tooltip>
        </span>
      )
    } else {
      return (
        <p>{text}</p>
      )
    }
  }

  const renderCondensedCols = () => {
    return (shiftDetailsData.data.map((shift) => (
      <tr key={shift.id} style={{background:getShiftColor(shift)}}>
        <td>{format(shift.startTime, "MM/dd/yyyy")}</td>
        <td>{shift.name ? shift.name + ": " + format(shift.startTime, "hh:mm aaaaa'm'") + ' - ' + format(shift.endTime, "hh:mm aaaaa'm'") : format(shift.startTime, "hh:mm aaaaa'm'") + ' - ' + format(shift.endTime, "hh:mm aaaaa'm'")}</td>
        <td>{renderCoverage(shift)}</td>
      </tr>)))
  }

  const renderAllCols = () => {
    return (shiftDetailsData.data.map((shift) => (
      <tr key={shift.id} style={{background:getShiftColor(shift)}}>
        <td>{format(shift.startTime, "MM/dd/yyyy")}</td>
        <td>{shift.name ? shift.name + ": " + format(shift.startTime, "hh:mm aaaaa'm'") + ' - ' + format(shift.endTime, "hh:mm aaaaa'm'") : format(shift.startTime, "hh:mm aaaaa'm'") + ' - ' + format(shift.endTime, "hh:mm aaaaa'm'")}</td>
        <td>{renderCoverage(shift)}</td>
        <td>{viewRosterButton()}</td>
        <td>{shift.status ? openStatusButton(shift) : closedStatusButton(shift)}</td>
        <td>{editButton(shift)}</td>
        <td>{emailButton()}</td>
      </tr>
    )))
  }

  const getShiftColor = shift => {
    if (format(shift.startTime, "MM/dd/yyyy") != prevStartDate) {
      prevStartDate = format(shift.startTime, "MM/dd/yyyy");
      return "#e6e6e6";
    } else {
      return "white";
    }
  }

  return (
    <div className="shiftdetails-container">
      {(!areColsExpanded && isMobileView) && <button onClick={() => {setAreColsExpanded(true)}}>View All Columns</button>}
      {(isMobileView && areColsExpanded) && <button onClick={() => {setAreColsExpanded(false)}}>Collapse Columns</button>}
      <table className="shiftsTable">
        <thead className="shiftsTableHeader" style={{position:stickyHeader,zIndex:headerZIndex,top:-1}}>
          <tr>
            {colsToRender.map((label) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="shiftsTableBody">
          {(isMobileView && !areColsExpanded) ? renderCondensedCols() : renderAllCols()}
        </tbody>
      </table>
    </div>
  );
}
