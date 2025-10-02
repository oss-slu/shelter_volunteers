import React, { useState } from 'react';
import { Pencil, Save, X } from 'lucide-react'; 
import "../../styles/volunteer/Profile.css";


// Helper function to perform client-side validation based on specific requirements
const validate = (data) => {
  const errors = {};
  
  // Regex for Phone number: standard phone formats. 
  const phoneRegex = /^(?:\+?\d{1,3}[- .]?)?\(?\d{3}\)?[- .]?\d{3}[- .]?\d{4}$/; 
  
  // Regex for allowed characters in the local part (username)
  // Allows letters, numbers, dot, plus, hyphen, underscore
  const allowedLocalPartRegex = /^[a-zA-Z0-9. +_-]+$/;
  
  // Regex for required Gmail/Googlemail domains (case-insensitive)
  const validDomainsRegex = /^(gmail\.com|googlemail\.com)$/i; 

  // --- Name Validation ---
  if (!data.name.trim()) {
    errors.name = 'Full Name is required.';
  } else if (data.name.trim().length < 3) {
    errors.name = 'Full Name must be at least 3 characters long.';
  }

  // --- Email Validation: Detailed, prioritized checks ---
  if (!data.email.trim()) {
    errors.email = 'Email Address is required.';
  } else {
    const emailValue = data.email.trim();
    
    // 1. Maximum Length Check (Total address)
    if (emailValue.length > 254) {
        errors.email = 'Maximum length exceeded. The email address cannot exceed 254 characters.';
        return errors;
    }
    
    // 2. Whitespace Check (Should ideally be done before splitting)
    if (/\s/.test(emailValue)) {
        errors.email = 'Email address cannot contain spaces or tabs.';
        return errors;
    }
    
    const parts = emailValue.split('@');
    const localPart = parts[0];
    const domainPart = parts[1];
    
    // 3. Missing required components / Structure Check (Must have exactly one '@' and non-empty parts)
    if (parts.length !== 2 || !localPart || !domainPart) {
        errors.email = 'Missing required components. Address must contain a username, an "@" symbol, and a domain name (e.g., username@gmail.com).';
        return errors;
    }
    
    // 4. Domain Check (Invalid characters/structure in domain and restricted domain)
    if (!validDomainsRegex.test(domainPart)) {
        errors.email = 'Invalid characters/structure in domain. Email must be a valid @gmail.com or @googlemail.com address.';
        return errors;
    }

    // 5. Max Local Part Length Check
    if (localPart.length > 64) {
        errors.email = 'The part before the @ symbol (username) cannot exceed 64 characters.';
        return errors;
    }
    
    // 6. Invalid Characters in Username (Strict check)
    if (!allowedLocalPartRegex.test(localPart)) {
        errors.email = 'Invalid characters in username. The username can only contain letters, numbers, periods (.), hyphens (-), underscores (_), and plus signs (+).';
        return errors;
    }
    
    // 7. Consecutive Periods in Username
    if (localPart.includes('..')) {
        errors.email = 'Consecutive periods (..) are not allowed in the username.';
        return errors;
    }

    // 8. Leading or Trailing Period
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
        errors.email = 'Leading or trailing period/hyphen. The username cannot begin or end with a period (.).';
        return errors;
    }
  }
  // --- End Email Validation ---

  // --- Phone Validation ---
  if (!data.phone.trim()) {
    errors.phone = 'Phone Number is required.';
  } else if (!phoneRegex.test(data.phone.trim())) {
    errors.phone = 'Invalid phone format. Use a standard format (e.g., 555-555-5555).';
  }

  return errors;
};


// This component allows the user to view and edit their profile information.
const ProfileSettings = () => {
  const initialData = {
    name: '',
    email: '',
    phone: '',
  };
  
  const [profileData, setProfileData] = useState(initialData);
  const [formData, setFormData] = useState(initialData);
  
  // Start in editing mode immediately if the profile is uninitialized.
  const [isEditing, setIsEditing] = useState(initialData.name === ''); 
  const [message, setMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({}); // New state for field-specific errors

  // Function to handle changes in form inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear the specific error for the field being edited
    if (validationErrors[e.target.name]) {
        setValidationErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
    // Clear general message if the user is typing
    if (message) {
        setMessage('');
    }
  };

  // Function to switch to edit mode
  const handleEdit = () => {
    setFormData(profileData); 
    setIsEditing(true);
    setMessage('');
    setValidationErrors({}); // Clear any prior errors
  };

  // Function to handle saving changes
  const handleSave = () => {
    // 1. Validation
    const errors = validate(formData);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      // If there are validation errors, display a general error message and stop.
      setMessage('Please correct the highlighted errors before saving.');
      return;
    }

    // 2. Clear general message and proceed with simulation
    setMessage(''); 
    console.log('Simulating save of new profile data:', formData);
    
    // 3. Simulate API Call
    setTimeout(() => {
        setProfileData(formData); 
        setIsEditing(false); 
        setMessage('Profile updated successfully!');
        setValidationErrors({}); // Clear errors on successful save
    }, 500);
  };

  // Function to handle canceling edits
  const handleCancel = () => {
    const resetData = profileData.name === '' ? initialData : profileData;
    setFormData(resetData);
    
    if (profileData.name !== '') {
        setIsEditing(false);
    }
    setMessage('');
    setValidationErrors({}); // Clear errors on cancel
  };

  // Helper function to render fields conditionally (display or input)
  const renderField = (label, name, value, type = 'text', error = null) => (
    <div className="profile-field-row">
      <label className="profile-label">{label}</label>
      <div className="profile-value-wrapper">
        {isEditing ? (
          <>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              // Add 'input-error' class when an error exists
              className={`profile-input ${error ? 'input-error' : ''}`}
              placeholder={label}
            />
            {/* Display error message */}
            {error && (
              <p className="error-text">{error}</p>
            )}
          </>
        ) : (
          <p className="profile-value">{value || `No ${label.toLowerCase()} provided.`}</p>
        )}
      </div>
    </div>
  );

  const primaryButtonText = profileData.name === '' ? 'Enter Profile Details' : 'Edit Profile';

  return (
    <div className="profile-container">
      
      <h1 className="profile-title">
        User Information
      </h1>
      {/* Message Box for success/error alerts */}
      {message && (
        <div 
          className={`profile-message ${
            message.includes('successfully') ? 'success' : 'error'
          }`}
          role="alert"
        >
          {message}
        </div>
      )}
      <div className="profile-card">
        {/* Profile Fields - passing validationErrors[name] to renderField */}
        {renderField('Full Name', 'name', profileData.name, 'text', validationErrors.name)}
        {renderField('Email Address', 'email', profileData.email, 'email', validationErrors.email)}
        {renderField('Phone Number', 'phone', profileData.phone, 'tel', validationErrors.phone)}
        {/* Action Buttons */}
        <div className="profile-actions">
          {isEditing ? (
            <>
              {profileData.name !== '' && (
                <button
                  onClick={handleCancel}
                  className="profile-button-secondary"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
              )}
              <button
                onClick={handleSave}
                className="profile-button-primary"
              >
                <Save size={18} />
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="profile-button-edit"
            >
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
