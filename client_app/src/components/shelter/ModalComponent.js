import React from 'react'; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import "../../styles/shelter/Modal.css"

export const ModalComponent = props => {
  const {isOpen, onRequestClose, renderData} = props;

  return (
    <>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={onRequestClose}>
              <FontAwesomeIcon icon={faCircleXmark} size="2x" className="closeIcon"/>
            </button>
            {renderData()}
          </div>
        </div>
      )}
    </>
  )
}