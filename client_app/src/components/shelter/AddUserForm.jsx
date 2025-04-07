import React, { useState } from "react";
import axios from "axios";
import { SERVER } from "../../config";

const AddUserForm = ({ shelterId }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${SERVER}/user_permission`,
        {
          resource_type: "shelter",
          resource_id: shelterId,
          user_email: email
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      if (response.status === 200) {
        setStatus({ type: "success", message: "User added successfully." });
        setEmail("");
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to add user."
      });
    }
  };

  return (
    <div className="add-user-form">
      <h2>Add Shelter Admin</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">User Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter user email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">Add User</button>
      </form>
      {status && (
        <div className={`message ${status.type}`}>{status.message}</div>
      )}
    </div>
  );
};

export default AddUserForm;
