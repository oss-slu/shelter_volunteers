import React, { useState } from 'react';
import { GoogleMap, Marker, InfoBox, LoadScript } from '@react-google-maps/api';
import IndividualShelter from './IndividualShelter';

const MapView = (props) => {
  const [selectedLocation, setSelectedLocation] = useState(null); 
  const [modalOpen, setModalOpen] = useState(false);

  function addShift(shift) {
    if (props.manageShiftsFunction) {
      props.manageShiftsFunction(shift);
    }
  }

  let center = {};
  let latCenter, lngCenter;
  const zoomMap = {
    5: 11, 
    10: 10,
    25: 9,
    50: 8, 
    100: 7 
  };
  if (!props.data) {
    // Return some fallback UI or handle the case where data is undefined
    center = { lat: 36.0522, lng: -120.2437 }; 
    return <div>No data available</div>;
  }

  else if (props.data.map((location, index) => {
    if (
      index === props.data.length - 1
    ) {
      latCenter = props.latitude;
      console.log("latCenter: " + latCenter);
      lngCenter = props.longitude;
      console.log("lngCenter: " + lngCenter);
      center = {lat: latCenter, lng: lngCenter};
    }
}));

  const zoomLevel = zoomMap[props.radius];
  console.log("Center is ", center.lat + "," + center.lng);
  console.log("zoomLevel: " + zoomLevel);
  const mapContainerStyle = {
    height: '400px',
    width: '100%',
  };

  //const center = { lat: 34.0522, lng: -118.2437 }; // Default center coordinates (Los Angeles)

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    setModalOpen(true);
    // Display alert with location ID
    //alert(`Clicked on location with ID: ${location.id}`);
  };

  const roundedInfoBoxStyle = {
  backgroundColor: 'white',
  padding: '3px',
  borderRadius: '8px', // Add border-radius for rounded corners
  //boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)', // Optional: Add box shadow for a better look
};
console.log("mapview rendered")
  return (
    <div>
      <LoadScript googleMapsApiKey="AIzaSyBXrh1xuvTDg3g30ZhPolEEOfnAGQKSdu8">
        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={zoomLevel}>
          {props.data
          .sort((a, b) => a.distance - b.distance)
          .map((shelter) => (
            <Marker
              key={shelter.id}
              position={{ lat: shelter.latitude, lng: shelter.longitude }}
              onMouseOver={modalOpen ? null : (e) => {
                e.domEvent.stopPropagation(); 
                setSelectedLocation(shelter);
              }} 
              onMouseOut={modalOpen ? null : () => {
                setSelectedLocation(null);
              }} 
              onClick={() => handleMarkerClick(shelter)}
            />
          ))}

           {selectedLocation && (
            <InfoBox
            position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
            options={{ closeBoxURL: '', enableEventPropagation: true, boxStyle: roundedInfoBoxStyle }}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div style={roundedInfoBoxStyle}>
              <h3>{selectedLocation.name}</h3>
            </div>
          </InfoBox>
          )}
          {modalOpen && (
        // Nest modals inside map 
        <React.Fragment>
          
          <div className="modal-backdrop" 
               onClick={() => setModalOpen(false)} 
          />
          <div className="modal">
            {/* Log data */}
            <h3>{selectedLocation.name}</h3>
            {selectedLocation && <IndividualShelter 
              shelter={selectedLocation}
              isSignupPage={props.isSignupPage}
              addShiftFunction={addShift} 
            />}
            <button onClick={() => setModalOpen(false)}>
            Close
            </button>
            </div>
            </React.Fragment>
      )}

    </GoogleMap>
            
      </LoadScript>
      
      <button onClick={props.onClose}>Close Map</button>
    </div>
  );
};

export default MapView;
