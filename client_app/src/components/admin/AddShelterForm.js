import React, { useState } from 'react';
import './AddShelterForm.css';

const AddShelterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    street_address_1: '',
    street_address_2: '',
    city: '',
    state: '',
    postal_code: '',
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
    const requiredFields = ['name', 'street_address_1', 'city', 'state', 'postal_code'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setSubmitMessage({
          type: 'error',
          text: `${field.replace('_', ' ')} is required`
        });
        return false;
      }
    }
    
    //if given long and lat, checking this here otherwise give fomratting error
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
      const response = await fetch('/api/shelter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      setSubmitMessage({
        type: 'success',
        text: 'Shelter added successfully!'
      });
      
      //reset to original form
      setFormData({
        name: '',
        street_address_1: '',
        street_address_2: '',
        city: '',
        state: '',
        postal_code: '',
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
        {/* form grouping for organization, need to style still */}
        <div className="form-group">
          <label htmlFor="street_address_1">Street Address 1 *</label>
          <input
            type="text"
            id="street_address_1"
            name="street_address_1"
            value={formData.street_address_1}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="street_address_2">Street Address 2</label>
          <input
            type="text"
            id="street_address_2"
            name="street_address_2"
            value={formData.street_address_2}
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
            <label htmlFor="postal_code">Postal Code *</label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
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