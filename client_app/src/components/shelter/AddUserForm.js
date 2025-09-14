import { useEffect, useState } from "react";
import { permissionsAPI } from "../../api/permission";
import { useParams } from "react-router-dom";

const AddUserForm = ({ resourceType = "shelter" }) => {
  const { shelterId } = useParams(); // grab the shelterId from URL

  const [admins, setadmins] = useState([]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const adminType = resourceType === "shelter" ? "Shelter Admin" : "System Admin";
  useEffect(() => {
    const retrievedAdmins = resourceType === "shelter" ? permissionsAPI.getShelterAdmins(shelterId) : permissionsAPI.getSystemAdmins();
    retrievedAdmins.then((admins) => {
      setadmins(admins);
    }).catch((error) => {
      console.error("Error fetching admins:", error);
      setStatus({ type: "error", message: "Failed to load admins." });
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = resourceType === "shelter"
        ? await permissionsAPI.addShelterAdmin(shelterId, email)
        : await permissionsAPI.addSystemAdmin(email);
      if (result?.success) {
        setStatus({ type: "success", message: result.message || "User added successfully." });
        setEmail("");
        setadmins(prev => [...prev, email]); // Update the admins list with the new email
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
    <div>
      <div className="add-user-form">
        <h2>Add {adminType}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">User Email</label>
            <div className="input-group">
              <input
                type="email"
                id="email"
                placeholder="Enter user email"
                value={email}
                className="form-control"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {
                email.length > 0 &&
                  <button type="button"
                          onClick={() => setEmail("")}
                          className="btn btn-warning m-0 w-auto px-3">Clear</button>
              }
            </div>
          </div>
          <button type="submit" className="submit-button">Add User</button>
        </form>
        {status && (
          <div className={`message ${status.type}`}>{status.message}</div>
        )}
      </div>
      <div>
        {admins.length === 0 ? (
          <li>No {adminType} users found.</li>
        ) : (
          <div>
            <h3 className="summary-title">
              Current {adminType} Users
            </h3>
            <div className="list">
              {admins.map((email) => {
                  return (
                    <div key={email}className="tagline-small">
                      {email}
                    </div>
                  );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUserForm;
