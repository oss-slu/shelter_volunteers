import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { shelterAPI } from "../api/shelter";
import "../styles/ShelterMap.css";
import { STL_CENTER, toMapPoints } from "../utils/mapPoints";

const DEFAULT_ZOOM = 11;

export { STL_CENTER, toMapPoints };

/** Zooms the map to show every point (expects `{ position: [lat, lng] }` items). */
export function FitToPoints({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(
        points.map((point) => point.position),
        { padding: [36, 36], maxZoom: 13 },
      );
    } else if (points.length === 1) {
      map.setView(points[0].position, 13);
    }
  }, [map, points]);
  return null;
}

function ShelterMap() {
  const [points, setPoints] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    shelterAPI
      .getShelters()
      .then((shelters) => {
        if (cancelled) return;
        setPoints(toMapPoints(shelters));
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  let caption;
  if (status === "loading") {
    caption = "Loading shelters…";
  } else if (status === "error") {
    caption = "Shelter locations are unavailable right now.";
  } else if (points.length === 0) {
    caption = "No shelters with a location yet.";
  } else {
    caption = `${points.length} partner shelter${points.length === 1 ? "" : "s"} across the region`;
  }

  return (
    <section className="landing-map" id="shelters" aria-labelledby="map-title">
      <div className="landing-map-heading">
        <p className="landing-eyebrow">Shelters near you</p>
        <h2 id="map-title">Help is closer than you think.</h2>
        <p>
          Shelters across the St. Louis area use Volunteer Connect to share
          when they need a hand. Sign in to see their open shifts.
        </p>
      </div>
      <div className="landing-map-frame">
        <MapContainer
          center={STL_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={false}
          className="landing-map-canvas"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((point) => (
            <CircleMarker
              key={point.id}
              center={point.position}
              radius={9}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: "#1769aa",
                fillOpacity: 0.95,
              }}
            >
              <Popup>
                <strong className="landing-map-popup-name">{point.name}</strong>
                {point.street && <span className="landing-map-popup-line">{point.street}</span>}
                {point.locality && (
                  <span className="landing-map-popup-line">{point.locality}</span>
                )}
              </Popup>
            </CircleMarker>
          ))}
          <FitToPoints points={points} />
        </MapContainer>
        <p className="landing-map-caption" role="status">
          <span className="landing-eyebrow-dot" aria-hidden="true" />
          {caption}
        </p>
      </div>
    </section>
  );
}

export default ShelterMap;
