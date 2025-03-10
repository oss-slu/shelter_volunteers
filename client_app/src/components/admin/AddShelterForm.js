import React, { useState } from 'react';
import '../../styles/admin/AddShelterForm.css';
import { SERVER } from "../../config";

const AddShelterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: '',
    longitude: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    const requiredFields = ['name', 'street1', 'city', 'state', 'postalCode'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setSubmitMessage({
          type: 'error',
          text: `${field.replace('_', ' ')} is required`
        });
        return false;
      }
    }
    
    //if given long and lat, checking this here otherwise give formatting error
    if (formData.latitude && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
      setSubmitMessage({
        type: 'error',
        text: 'Latitude must be a number between -90 and 90'
      });
      return false;
    }
    
    if (formData.longitude && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
      setSubmitMessage({
        type: 'error',
        text: 'Longitude must be a number between -180 and 180'
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });
    
    try {
      const formattedData = {
        name: formData.name,
        address: {
          street1: formData.street1,
          street2: formData.street2,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          coordinates: {
            latitude: formData.latitude,
            longitude: formData.longitude
          }
        },
      };
    
      const response = await fetch(`${SERVER}/shelter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      await response.json();
      
      setSubmitMessage({
        type: 'success',
        text: 'Shelter added successfully!'
      });
      
      //reset to original form
      setFormData({
        name: '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        latitude: '',
        longitude: ''
      });
      
    } catch (error) {
      console.error('Error adding shelter:', error);
      setSubmitMessage({
        type: 'error',
        text: `Failed to add shelter: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="add-shelter-form-container">
      <h2>Add New Shelter</h2>
      {submitMessage.text && (
        <div className={`message ${submitMessage.type}`}>
          {submitMessage.text}
        </div>
      )}
      <form onSubmit={handleSubmit}> 
        <div className="form-group">
          <label htmlFor="name">Shelter Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        {/* form grouping for organization */}
        <div className="form-group">
          <label htmlFor="street1">Street Address 1 *</label>
          <input
            type="text"
            id="street1"
            name="street1"
            value={formData.street1}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="street2">Street Address 2</label>
          <input
            type="text"
            id="street2"
            name="street2"
            value={formData.street2}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="state">State *</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="postalCode">Postal Code *</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              step="any"
              min="-90"
              max="90"
            />
          </div>
          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              step="any"
              min="-180"
              max="180"
            />
          </div>
        </div>   
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Shelter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddShelterForm;