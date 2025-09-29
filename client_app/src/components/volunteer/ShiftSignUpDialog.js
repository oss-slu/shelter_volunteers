import { useState } from "react";

const ShiftSignUpDialog = ({ onDismiss, onConfirm }) => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { id, value } = e.target;
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      [id]: value,
    }));

    // Clear the error for the field being edited
    if (errors[id]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: "",
      }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Name validation: must be a non-empty string with at least two words
    const nameRegex = /^[A-Za-z]+\s[A-Za-z]+$/;
    if (!userInfo.name.trim()) {
      newErrors.name = "Name is required.";
      isValid = false;
    } else if (!nameRegex.test(userInfo.name.trim())) {
      newErrors.name = "Please enter your full first and last name.";
      isValid = false;
    }

    // Phone number validation: 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!userInfo.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
      isValid = false;
    } else if (!phoneRegex.test(userInfo.phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted successfully:", userInfo);
      onConfirm(userInfo);
    } else {
      console.log("Form has validation errors.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onDismiss}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h1 className="mb-3">Contact Information</h1>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              First and Last Name
            </label>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              id="name"
              placeholder="John Smith"
              value={userInfo.name}
              onChange={handleChange}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="phoneNumber" className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              className={`form-control ${errors.phoneNumber ? "is-invalid" : ""}`}
              id="phoneNumber"
              placeholder="3141231234"
              value={userInfo.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
          </div>
          <button type="submit" className="btn btn-primary">
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShiftSignUpDialog;
