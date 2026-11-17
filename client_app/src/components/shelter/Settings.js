// client_app/src/components/shelter/Settings.js
import React from "react";
import { useParams, Link } from "react-router-dom";
import AddUserForm from "./AddUserForm";

const Settings = () => {
  const { shelterId } = useParams(); // extract shelterId from URL

  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>
      <AddUserForm shelterId={shelterId} />
      {/* Add link to define repeatable shifts */}
      <Link to={`/shelter-dashboard/${shelterId}/repeatable-shifts`}>
        <button>Define Repeatable Shifts</button>
      </Link>
    </div>
  );
};

export default Settings;
