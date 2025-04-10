// client_app/src/components/shelter/Settings.js
import React from "react";
import { useParams } from "react-router-dom";
import AddUserForm from "./AddUserForm";

const Settings = () => {
  const { shelterId } = useParams(); // extract shelterId from URL

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <AddUserForm shelterId={shelterId} />
    </div>
  );
};

export default Settings;
