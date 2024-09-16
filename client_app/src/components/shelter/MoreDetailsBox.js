import React from "react";

const MoreDetailsBox = () => {

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Shift Details</h2>
        <p>Start Time: </p>
        <p>End Time: </p>
        <p>Requested Volunteers: </p>
        <p>Signed Up Volunteers: </p>
        <p>Required Volunteers: </p>
        <button >Request More Volunteers</button>
        <button>Close Sign-up of Volunteers</button>
        <button>Close Request</button>
        <button>Close Modal</button>
      </div>
    </div>
  );
};

export default MoreDetailsBox;