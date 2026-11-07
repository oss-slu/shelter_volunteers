import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { shelterAPI } from "../../api/shelter";
import { serviceShiftAPI } from "../../api/serviceShift";
import { formatDate } from "../../formatting/FormatDateTime";
import { STL_CENTER } from "../../utils/mapPoints";
import { buildShelterPoints, formatDistance } from "../../utils/nearbyShelters";
import { FitToPoints } from "../ShelterMap";
import "../../styles/volunteer/NearbySheltersMap.css";

const SIGNUP_PATH = "/volunteer-dashboard/shelters";
const NEAREST_LIMIT = 4;

const openMarker = (count) => ({
  radius: 7 + Math.min(count, 6),
  pathOptions: { color: "#ffffff", weight: 2, fillColor: "#1769aa", fillOpacity: 0.95 },
});
const closedMarker = {
  radius: 5,
  pathOptions: { color: "#ffffff", weight: 1.5, fillColor: "#94a3b8", fillOpacity: 0.7 },
};
const userMarker = {
  radius: 8,
  pathOptions: { color: "#ffffff", weight: 3, fillColor: "#16a34a", fillOpacity: 1 },
};

function shiftsLabel(count) {
  return `${count} open shift${count === 1 ? "" : "s"}`;
}

/**
 * Volunteer dashboard map: where shelters are, which have open shifts, and
 * (after the volunteer shares their location) which of those are nearest.
 */
function NearbySheltersMap() {
  const [shelters, setShelters] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [userPosition, setUserPosition] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle");

  useEffect(() => {
    let cancelled = false;
    Promise.all([shelterAPI.getShelters(), serviceShiftAPI.getFutureShifts()])
      .then(([shelterList, shiftList]) => {
        if (cancelled) return;
        setShelters(Array.isArray(shelterList) ? shelterList : []);
        setShifts(Array.isArray(shiftList) ? shiftList : []);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const points = useMemo(
    () => buildShelterPoints(shelters, shifts, userPosition),
    [shelters, shifts, userPosition],
  );
  const openPoints = useMemo(() => points.filter((p) => p.openCount > 0), [points]);
  const nearest = openPoints.slice(0, NEAREST_LIMIT);

  // What the map zooms to: you + your nearest open shelters, otherwise every shelter.
  const fitPoints = useMemo(() => {
    if (userPosition) {
      return [{ position: userPosition }, ...openPoints.slice(0, NEAREST_LIMIT)];
    }
    return openPoints.length ? openPoints : points;
  }, [userPosition, openPoints, points]);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        setGeoStatus("ready");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  const geoMessage = {
    locating: "Finding your location…",
    denied: "Couldn't get your location. Check your browser's location permission.",
    unsupported: "Your browser can't share a location.",
  }[geoStatus];

  return (
    <section className="nearby-map" aria-labelledby="nearby-map-title">
      <header className="nearby-map-header">
        <div>
          <h2 id="nearby-map-title" className="nearby-map-title">Shelters near you</h2>
          <p className="nearby-map-subtitle">
            {status === "loading" && "Loading shelters…"}
            {status === "error" && "Shelter locations are unavailable right now."}
            {status === "ready" &&
              (openPoints.length
                ? `${openPoints.length} shelter${openPoints.length === 1 ? "" : "s"} with open shifts`
                : "No shelters have open shifts right now.")}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm nearby-map-locate"
          onClick={locate}
          disabled={geoStatus === "locating" || status !== "ready"}
        >
          {userPosition ? "Update my location" : "Use my location"}
        </button>
      </header>
      {geoMessage && (
        <p className="nearby-map-geo" role="status">
          {geoMessage}
        </p>
      )}
      <div className="nearby-map-frame">
        <MapContainer center={STL_CENTER} zoom={11} scrollWheelZoom={false} className="nearby-map-canvas">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Grey (no open shifts) first so blue markers draw on top. */}
          {[...points].reverse().map((point) => {
            const marker = point.openCount ? openMarker(point.openCount) : closedMarker;
            return (
              <CircleMarker key={point.id} center={point.position} {...marker}>
                <Popup>
                  <strong className="nearby-popup-name">{point.name}</strong>
                  {point.street && <span className="nearby-popup-line">{point.street}</span>}
                  {point.locality && <span className="nearby-popup-line">{point.locality}</span>}
                  <span className="nearby-popup-meta">
                    {point.openCount ? shiftsLabel(point.openCount) : "No open shifts right now"}
                    {point.distance != null && ` · ${formatDistance(point.distance)}`}
                  </span>
                  {point.openCount > 0 && (
                    <Link className="nearby-popup-link" to={`${SIGNUP_PATH}#shelter-${point.id}`}>
                      View shifts →
                    </Link>
                  )}
                </Popup>
              </CircleMarker>
            );
          })}
          {userPosition && (
            <CircleMarker center={userPosition} {...userMarker}>
              <Popup>You are here</Popup>
            </CircleMarker>
          )}
          {fitPoints.length > 0 && <FitToPoints points={fitPoints} />}
        </MapContainer>
        <ul className="nearby-map-legend" aria-label="Map legend">
          <li><span className="nearby-dot nearby-dot--open" aria-hidden="true" />Open shifts</li>
          <li><span className="nearby-dot nearby-dot--closed" aria-hidden="true" />No open shifts</li>
          {userPosition && <li><span className="nearby-dot nearby-dot--you" aria-hidden="true" />You</li>}
        </ul>
      </div>
      {nearest.length > 0 && (
        <div className="nearby-list">
          <h3 className="nearby-list-title">
            {userPosition ? "Closest with open shifts" : "Open shifts coming up"}
          </h3>
          <ol className="nearby-list-items">
            {nearest.map((point) => (
              <li key={point.id}>
                <Link className="nearby-list-item" to={`${SIGNUP_PATH}#shelter-${point.id}`}>
                  <span className="nearby-list-name">{point.name}</span>
                  <span className="nearby-list-meta">
                    {shiftsLabel(point.openCount)}
                    {point.nextStart != null && ` · next ${formatDate(point.nextStart)}`}
                  </span>
                  {point.distance != null && (
                    <span className="nearby-list-distance">{formatDistance(point.distance)}</span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

export default NearbySheltersMap;
