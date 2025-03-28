import React, { useState, useEffect } from 'react';
import '../../styles/admin/ShelterList.css';
import {shelterAPI} from '../../api/shelter';

const ShelterList = () => {
  const [shelters, setShelters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const data = await shelterAPI.getShelters()
        setShelters(Array.isArray(data) ? data : [data]);
        setError(null);
      } catch (err) {
        console.error('Error fetching shelters:', err);
        setError('Failed to load shelters. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShelters();
  }, []);
  
  return (
    <div className="shelter-list-container">
      <h2>All Shelters</h2>
      {isLoading && <div className="loading">Loading shelters...</div>} 
      {error && (
        <div className="error-message">{error}</div>
      )}
      {!isLoading && !error && shelters.length === 0 && (
        <div className="no-shelters">
          No shelters found. Add a shelter to get started.
        </div>
      )}
      {!isLoading && !error && shelters.length > 0 && (
        <div className="shelters-table-container">
          <table className="shelters-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Postal Code</th>
                <th>Coordinates</th>
              </tr>
            </thead>
            <tbody>
              {shelters.map((shelter, index) => (
                <tr key={shelter._id || shelter.id || index}>
                  <td>{shelter.name}</td>
                  <td>
                    {shelter.address?.street1 || shelter.street1}
                    {(shelter.address?.street2 || shelter.street2) && 
                      <>, {shelter.address?.street2 || shelter.street2}</>}
                  </td>
                  <td>{shelter.address?.city || shelter.city}</td>
                  <td>{shelter.address?.state || shelter.state}</td>
                  <td>{shelter.address?.postalCode || shelter.postalCode}</td>
                  <td>
                    {(shelter.address?.coordinates &&
                      shelter.address.coordinates.latitude &&
                      shelter.address.coordinates.longitude)
                      ? `${shelter.address.coordinates.latitude},
                        ${shelter.address.coordinates.longitude}`
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShelterList;