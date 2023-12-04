import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoBox, useJsApiLoader } from '@react-google-maps/api';
import IndividualShelter from './IndividualShelter';

const MapView = (props) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [map, setMap] = useState(null);

  useEffect(() => {
    setIsApiLoaded(true);
  }, []);
  function addShift(shift) {
    if (props.manageShiftsFunction) {
      props.manageShiftsFunction(shift);
    }
  }

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    loadGoogleMapsApi: !isApiLoaded,
  });
  const center = {
    lat: props.latitude || 33.997103,
    lng: props.longitude || -118.4472731,
  };

  const zoomMap = {
    5: 11,
    10: 10,
    25: 9,
    50: 8,
    100: 7,
  };

  const zoomLevel = zoomMap[props.radius];

  const mapContainerStyle = {
    height: '400px',
    width: '100%',
  };

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    setModalOpen(true);
  };

  const roundedInfoBoxStyle = {
    backgroundColor: 'white',
    padding: '3px',
    borderRadius: '8px',
  };

  const onLoad = (map) => {
    const radiusInMeters = props.radius * 1609.34;
    const bounds = new window.google.maps.Circle({
      center: center,
      radius: radiusInMeters,
    }).getBounds();
  
    map.fitBounds(bounds);
    setMap(map);
  };

  const onUnmount = () => {
    setMap(null);
  };

  return isLoaded ? (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoomLevel}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {props.data &&
          props.data
            .sort((a, b) => a.distance - b.distance)
            .map((shelter) => (
              <Marker
                key={shelter.id}
                position={{ lat: shelter.latitude, lng: shelter.longitude }}
                onMouseOver={modalOpen ? null : (e) => {
                  e.domEvent.stopPropagation(); 
                  setSelectedLocation(shelter);
                }} 
                onMouseOut={modalOpen ? null : () => setSelectedLocation(null)}
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
          <React.Fragment>
            <div className="modal-backdrop" onClick={() => setModalOpen(false)} />
            <div className="modal">
              <h3>{selectedLocation.name}</h3>
              {selectedLocation && (
                <IndividualShelter shelter={selectedLocation} isSignupPage={true} addShiftFunction={addShift} />
              )}
              <button onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </React.Fragment>
        )}
      </GoogleMap>
      <button onClick={props.onClose}>Close Map</button>
    </div>
  ) : null;
};

export default React.memo(MapView);
