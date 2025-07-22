import { useEffect, useState } from "react";
import { permissionsAPI } from "../../api/permission";
import { useParams } from "react-router-dom";

const AddUserForm = ({ resourceType = "shelter" }) => {
  const { shelterId } = useParams(); // grab the shelterId from URL

  const [admins, setadmins] = useState([]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

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
      const result = await permissionsAPI.addPermission({
        resource_type: resourceType, // use the parameter here
        resource_id: resourceType === "shelter" ? shelterId : undefined,
        user_email: email,
      });
      console.log('result', result); // Log the result for debugging
      if (result?.success) {
        setStatus({ type: "success", message: result.message || "User added successfully." });
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
    <div>
      <div>
        {admins.length === 0 ? (
          <li>No admin users found.</li>
        ) : (
          <div>
            <h2>Current admin users:</h2>
            <ul>
              {admins.map((admin) => (
                <li key={admin.id || admin.email}>{admin.email}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="add-user-form">
        <h2>Add {resourceType === "shelter" ? "Shelter" : "System"} Admin</h2>
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
    </div>
  );
};

export default AddUserForm;
