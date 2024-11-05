import React from 'react'; 
import { ModalComponent } from './ModalComponent';
import { ENVIROMENT } from '../../config.js';
import "../../styles/shelter/confirmStatusModal.css"
import { format } from "date-fns";

export const EditStatusConfirmationModal = props => {
  const {isStatusModalOpen, setIsStatusModalOpen, shift} = props;

  const onYesClick = () => {
    if (ENVIROMENT === "development") {
      console.log("changed shift status to: " + !shift.status); 
    }
    setIsStatusModalOpen(false);
  }

  const onNoClick = () => {
    setIsStatusModalOpen(false);
  }

  const renderData = () => {
    return (
      <div>
        <div className="confirmationMessage">
          <span>
            Do you want to <b>{!shift.status ? "open" : "close"}</b> volunteer registration on <b>{format(shift.startTime, "MM/dd/yyyy")}</b> from <b>{format(shift.startTime, "hh:mm aaaaa'm'")}</b> to <b>{format(shift.endTime, "hh:mm aaaaa'm'")}</b>?
          </span>
        </div>
        <div className="buttonContainer">
          <button className="yesStatusButton" onClick={() => onYesClick()}>
            Yes
          </button>
          <button className="noStatusButton" onClick={() => onNoClick()}>
            No
          </button>
        </div>
      </div>
    ) 
  }

  return (
    <ModalComponent
      isOpen={isStatusModalOpen}
      onRequestClose={() => setIsStatusModalOpen(false)}
      renderData={renderData}
    /> 
  )
}