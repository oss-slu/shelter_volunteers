import React, { useState } from "react";
import { permissionsAPI } from "../../api/permission";

const AddUserForm = ({ shelterId }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await permissionsAPI.addPermission({
        resource_type: "shelter",
        resource_id: shelterId,
        user_email: email,
      });

      if (result?.success) {
        setStatus({ type: "success", message: "User added successfully." });
        setEmail("");
      } else {
        throw new Error(result?.message || "Unknown error");
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Failed to add user.",
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
