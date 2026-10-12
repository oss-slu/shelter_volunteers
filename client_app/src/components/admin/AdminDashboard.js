import React, { useState } from "react";
import AddShelterForm from "./AddShelterForm";
import ShelterList from "./ShelterList";
import OpenSheltersByDate from "./OpenSheltersByDate";
import "../../styles/admin/AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("view");
  return (
    <div className="admin-dashboard">
      <h1>System Admin Dashboard</h1>
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "view" ? "active" : ""}`}
          aria-pressed={activeTab === "view"}
          onClick={() => setActiveTab("view")}>
          View All Shelters
        </button>
        <button
          className={`tab-button ${activeTab === "add" ? "active" : ""}`}
          aria-pressed={activeTab === "add"}
          onClick={() => setActiveTab("add")}>
          Add New Shelter
        </button>
        <button
          className={`tab-button ${activeTab === "open" ? "active" : ""}`}
          aria-pressed={activeTab === "open"}
          onClick={() => setActiveTab("open")}>
          Open Shelters by Date
        </button>
      </div>
      <div className="tab-content">
        {activeTab === "add" && <AddShelterForm />}
        {activeTab === "view" && <ShelterList />}
        {activeTab === "open" && <OpenSheltersByDate />}
      </div>
    </div>
  );
};

export default AdminDashboard;
