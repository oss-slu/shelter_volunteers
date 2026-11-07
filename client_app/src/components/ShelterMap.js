import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { shelterAPI } from "../api/shelter";
import "../styles/ShelterMap.css";

// Downtown St. Louis — used until shelters load, or when none have coordinates.
export const STL_CENTER = [38.627, -90.1994];
const DEFAULT_ZOOM = 11;

/**
 * Keep only shelters with usable coordinates and flatten them into map points.
 */
export function toMapPoints(shelters) {
  if (!Array.isArray(shelters)) return [];
  return shelters
    .map((shelter) => {
      const coords = shelter?.address?.coordinates || {};
      const lat = Number(coords.latitude);
      const lng = Number(coords.longitude);
      if (
        coords.latitude == null ||
        coords.longitude == null ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        Math.abs(lat) > 90 ||
        Math.abs(lng) > 180
      ) {
        return null;
      }
      const { street1, city, state, postal_code: postalCode } = shelter.address;
      return {
        id: shelter._id || `${shelter.name}-${lat}-${lng}`,
        name: shelter.name,
        street: street1 || "",
        locality: [city, [state, postalCode].filter(Boolean).join(" ")]
          .filter(Boolean)
          .join(", "),
        position: [lat, lng],
      };
    })
    .filter(Boolean);
}

function FitToPoints({ points }) {
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
