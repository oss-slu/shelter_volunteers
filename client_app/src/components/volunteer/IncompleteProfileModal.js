import React from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { AlertCircle, User, X } from "lucide-react";
import "../../styles/volunteer/IncompleteProfileModal.css";

/**
 * Modal component that appears when a volunteer logs in with an incomplete profile.
 * Prompts the user to complete their profile information (firstName, lastName, phone).
 */
const IncompleteProfileModal = ({ isOpen, onClose, onNavigateToProfile }) => {
  const navigate = useNavigate();

  const handleCompleteProfile = () => {
    onClose();
    if (onNavigateToProfile) {
      onNavigateToProfile();
    } else {
      navigate("/volunteer-dashboard/profile");
    }
  };

  const handleRemindLater = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleRemindLater}
      className="incomplete-profile-modal"
      overlayClassName="incomplete-profile-overlay"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <div className="modal-icon-container">
          <AlertCircle size={32} className="modal-alert-icon" />
        </div>
        <button className="modal-close-btn" onClick={handleRemindLater} aria-label="Close">
          <X size={20} />
        </button>
      </div>
      <div className="modal-body">
        <h2 className="modal-title">Complete Your Profile</h2>
        <p className="modal-description">
          Welcome! Your profile is missing some important information. Please complete your 
          profile to help shelters contact you about volunteer opportunities.
        </p>
        <div className="missing-fields-info">
          <User size={18} className="info-icon" />
          <span>Required: First Name, Last Name, and Phone Number</span>
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={handleRemindLater}>
          Remind Me Later
        </button>
        <button className="btn-primary" onClick={handleCompleteProfile}>
          Complete Profile
        </button>
      </div>
    </Modal>
  );
};

export default IncompleteProfileModal;
