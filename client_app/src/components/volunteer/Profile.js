import React, { useState, useContext, useEffect } from "react";
import { Pencil, Save, X, Lock } from "lucide-react";
import "../../styles/volunteer/Profile.css";
import { getUserProfile, postUserProfile } from "../../api/volunteerApi";

const mockAuthUser = {
  email: "volunteer.volunteer@gmail.com",
  id: "user-123",
};

// Placeholder for useAuth hook based on file analysis
const AuthContext = React.createContext({ user: mockAuthUser });
const useAuth = () => useContext(AuthContext);

// Helper function to perform client-side validation based on specific requirements
const validate = (data) => {
  const errors = {};

  // Regex for Phone number: standard phone formats.
  const phoneRegex = /^(?:\+?\d{1,3}[- .]?)?\(?\d{3}\)?[- .]?\d{3}[- .]?\d{4}$/;

  // --- First Name Validation (Required) ---
  if (!data.firstName.trim()) {
    errors.firstName = "First Name is required.";
  }

  // --- Last Name Validation (Required) ---
  if (!data.lastName.trim()) {
    errors.lastName = "Last Name is required.";
  }

  // --- Phone Validation (Required) ---
  if (!data.phone.trim()) {
    errors.phone = "Phone Number is required.";
  } else if (!phoneRegex.test(data.phone.trim())) {
    errors.phone = "Invalid phone format. Use a standard format (e.g., 555-555-5555).";
  }

  // --- Skills Validation (Non-Compulsory, but check max length) ---
  if (data.skills.trim().length > 250) {
    errors.skills = "Skills list cannot exceed 250 characters.";
  }

  return errors;
};

// This component allows the user to view and edit their profile information.
const ProfileSettings = () => {
  const { user: authUser } = useAuth(); // Use the mock/real auth user

  const initialData = {
    firstName: "",
    lastName: "",
    email: authUser.email || "", // Sourced from OAuth
    phone: "",
    skills: "",
  };

  // Pre-populate fields
  useEffect(() => {
    let cancelled = false;
    setIsLoadingInitialData(true);
    getUserProfile().then((response) => {
      if (cancelled) return;
      const data =
        response !== null
          ? {
              firstName: response.first_name ?? "",
              lastName: response.last_name ?? "",
              email: response.email ?? authUser.email ?? "",
              phone: response.phone_number?.toString() ?? "",
              skills: response.skills?.join(", ") ?? "",
            }
          : initialData;
      setProfileData(data);
      setIsLoadingInitialData(false);
      setIsEditing(data.firstName === "" || data.lastName === "" || data.phone === "");
    });

    return () => {
      cancelled = true;
      setIsLoadingInitialData(false);
    };
  }, []);

  const [profileData, setProfileData] = useState(initialData);
  const [formData, setFormData] = useState(initialData);

  // Start in editing mode immediately if any REQUIRED fields are uninitialized.
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [isPosting, setIsPosting] = useState(false);

  // Function to handle changes in form inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear the specific error for the field being edited
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
    // Clear general message if the user is typing
    if (message) {
      setMessage("");
    }
  };

  // Function to switch to edit mode
  const handleEdit = () => {
    setFormData(profileData);
    setIsEditing(true);
    setMessage("");
    setValidationErrors({}); // Clear any prior errors
  };

  // Function to handle saving changes
  const handleSave = () => {
    // 1. Validation
    const errors = validate(formData);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage("Please correct the highlighted errors before saving.");
      return;
    }

    // Send POST.
    setMessage("");
    setIsPosting(true);
    postUserProfile({
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phone,
      skills: formData.skills.split(",").map((x) => x.trim()),
    })
      .then((response) => {
        setProfileData({
          firstName: response.first_name ?? "",
          lastName: response.last_name ?? "",
          email: response.email ?? authUser.email ?? "",
          phone: response.phone_number?.toString() ?? "",
          skills: response.skills?.join(", ") ?? "",
        });
        setIsEditing(false);
        setMessage("Profile updated.");
      })
      .catch((errors) => {
        setValidationErrors(errors);
      })
      .finally(() => {
        setIsPosting(false);
      });
  };

  // Function to handle canceling edits
  const handleCancel = () => {
    // Check if all required fields are missing
    const requiredFieldsEmpty =
      profileData.firstName === "" && profileData.lastName === "" && profileData.phone === "";
    const resetData = requiredFieldsEmpty ? initialData : profileData;
    setFormData(resetData);

    // Only exit editing mode if all required data has been previously saved
    if (profileData.firstName !== "" && profileData.lastName !== "" && profileData.phone !== "") {
      setIsEditing(false);
    }
    setMessage("");
    setValidationErrors({}); // Clear errors on cancel
  };

  // Helper function to render fields conditionally (display or input)
  const renderField = (label, name, value, type = "text", error = null, isReadOnly = false) => (
    <div className="profile-field-row">
      <label className="profile-label">{label}</label>
      <div className="profile-value-wrapper">
        {isEditing ? (
          <>
            <div className={`profile-input-group ${isReadOnly ? "readonly-group" : ""}`}>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                readOnly={isReadOnly}
                className={`profile-input ${error ? "input-error" : ""} ${isReadOnly ? "bg-gray-100" : ""}`}
                placeholder={label}
              />
              {isReadOnly && <Lock size={18} className="lock-icon" />}
            </div>
            {error && <p className="error-text">{error}</p>}
          </>
        ) : (
          <p className="profile-value text-start">
            {value ||
              (isLoadingInitialData
                ? "Loading information"
                : `No ${label.toLowerCase()} provided.`)}
          </p>
        )}
      </div>
    </div>
  );

  // Primary button text logic based on required fields only
  const primaryButtonText =
    profileData.firstName === "" || profileData.lastName === "" || profileData.phone === ""
      ? "Enter Profile Details"
      : "Edit Profile";

  // --- UPDATED SKILLS EXAMPLE STRING ---
  const skillsExamples =
    "First aid/CPR, Narcan (naloxone), De-escalation/conflict resolution, Trauma-informed care, Mental health first aid";

  return (
    <div className="profile-container">
      <h1 className="profile-title">Contact Information</h1>
      {/* Message Box for success/error alerts */}
      {message && (
        <div
          className={`profile-message ${message.includes("successfully") ? "success" : "error"}`}
          role="alert">
          {message}
        </div>
      )}
      <div className="profile-card">
        {/* Profile Fields */}
        {/* First Name - Editable & Required */}
        {renderField(
          "First Name",
          "firstName",
          profileData.firstName,
          "text",
          validationErrors.firstName,
        )}
        {/* Last Name - Editable & Required */}
        {renderField(
          "Last Name",
          "lastName",
          profileData.lastName,
          "text",
          validationErrors.lastName,
        )}
        {/* Email - Read Only from OAuth (Locked) */}
        {renderField("Email Address ", "email", profileData.email, "email", null, true)}
        {/* Phone - Editable & Required */}
        {renderField("Phone Number", "phone", profileData.phone, "tel", validationErrors.phone)}
        {/* Skills - Optional (UPDATED) */}
        {renderField(
          `Skills (Optional - e.g., ${skillsExamples})`, // The full label
          "skills",
          profileData.skills,
          "text",
          validationErrors.skills,
        )}
        {/* Action Buttons */}
        <div className="profile-actions">
          {isEditing ? (
            <>
              {/* Only show cancel if all required profile data has been previously saved */}
              {profileData.firstName !== "" &&
                profileData.lastName !== "" &&
                profileData.phone !== "" && (
                  <button
                    disabled={isPosting}
                    onClick={handleCancel}
                    className="profile-button-secondary">
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                )}
              <button disabled={isPosting} onClick={handleSave} className="profile-button-primary">
                <Save size={18} />
                <span>{isPosting ? "Saving Changes..." : "Save Changes"}</span>
              </button>
            </>
          ) : (
            <button onClick={handleEdit} className="profile-button-edit">
              <Pencil size={18} />
              <span>{primaryButtonText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
