import React, { useState, useEffect } from 'react';
import '../../styles/admin/ShelterList.css';
import { SERVER } from "../../config";

const ShelterList = () => {
  const [shelters, setShelters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await fetch(`${SERVER}/shelter`);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        const rawText = await response.text(); //get raw text to deal with malformed JSON situtation
        let data; //first attempt to fix malformed JSON (concatenated sequence)
        try {
          data = JSON.parse(rawText);
        } catch (parseError) {
          if (rawText.trim().startsWith('{') && !rawText.trim().startsWith('[')) {
            try {
              const fixedJson = '[' + rawText.replace(/}{/g, '},{') + ']';
              data = JSON.parse(fixedJson);
            } catch (fixError) {
              //attempt 2 for malformed JSON using regex to find valid JSON objects
              try {
                const jsonObjects = [];
                let objStr = '';
                let braceCount = 0;
                for (let i = 0; i < rawText.length; i++) {
                  const char = rawText[i];
                  if (char === '{') braceCount++;
                  if (char === '}') braceCount--;
                  objStr += char;
                  if (braceCount === 0 && objStr.trim() !== '') {
                    try {
                      const parsedObj = JSON.parse(objStr);
                      jsonObjects.push(parsedObj);
                      objStr = '';
                    } catch (e) {
                      //continue
                    }
                  }
                }
                if (jsonObjects.length > 0) {
                  data = jsonObjects;
                } else {
                  throw new Error("Could not extract valid JSON objects");
                }
              } catch (regexError) {
                throw new Error(`Advanced JSON fixing failed: ${regexError.message}`);
              }
            }
          } else {
            throw parseError;
          }
        }
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