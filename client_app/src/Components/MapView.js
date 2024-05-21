import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, InfoBox, useJsApiLoader } from "@react-google-maps/api";
import IndividualShelter from "./IndividualShelter";
import { GOOGLE_MAPS_API_KEY } from "../config";
import "../styles/MapView.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const MapView = (props) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    setIsApiLoaded(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function addShift(shift) {
    if (props.manageShiftsFunction) {
      props.manageShiftsFunction(shift);
    }
  }

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
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
    height: "400px",
    width: "100%",
  };

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    setModalOpen(true);
  };

  const onLoad = (map) => {
    const radiusInMeters = props.radius * 1609.34;
    const bounds = new window.google.maps.Circle({
      center: center,
      radius: radiusInMeters,
    }).getBounds();

    map.fitBounds(bounds);
  };

  const onUnmount = () => {
  };

  return isLoaded ? (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoomLevel}
        onLoad={onLoad}
        onUnmount={onUnmount}>
        {props.data &&
          props.data
            .sort((a, b) => a.distance - b.distance)
            .map((shelter) => (
              <Marker
                key={shelter.id}
                position={{ lat: shelter.latitude, lng: shelter.longitude }}
                onMouseOver={
                  modalOpen ? null : (e) => {
                        e.domEvent.stopPropagation();
                        setSelectedLocation(shelter);
                  }
                }
                onMouseOut={modalOpen ? null : () => setSelectedLocation(null)}
                onClick={() => handleMarkerClick(shelter)}
              />
              
            ))}
        {selectedLocation && (
          <InfoBox
            position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
            options={{
              closeBoxURL: "",
              enableEventPropagation: true,
            }}
            onCloseClick={() => setSelectedLocation(null)}>
            <div className={isMobile ? "hide-on-mobile" : ""}>
              <h3 className="infobox-style">{selectedLocation.name}</h3>
            </div>
          </InfoBox>
        )}
        {modalOpen && (
          <React.Fragment>
            <div className="modal-backdrop-view" onClick={() => setModalOpen(false)} />
            <div className="modal-mapview">
              {selectedLocation && (
                <IndividualShelter
                  shelter={selectedLocation}
                  isSignupPage={true}
                  isMapPopup = {true}
                  addShiftFunction={addShift}
                />
              )}
              <button className="info-close-button" onClick={() => setModalOpen(false)}><FontAwesomeIcon icon={faXmark} /></button>
            </div>
          </React.Fragment>
        )}
      </GoogleMap>
    </div>
  ) : null;
};

export default MapView;
