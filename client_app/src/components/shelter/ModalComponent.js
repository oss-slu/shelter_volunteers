import React from 'react'; 
import Modal from 'react-modal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import "../../styles/shelter/Modal.css"

export const ModalComponent = props => {
  const {isOpen, onRequestClose, renderData} = props;

  return (
    <div>
      <Modal 
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        className="modalComponent"
        ariaHideApp={false}
      > 
        <button className="close-btn" onClick={onRequestClose}>
          <FontAwesomeIcon icon={faCircleXmark} size="2x" className="closeIcon"/>
        </button>
        {renderData()}
      </Modal>
    </div>
  )
}