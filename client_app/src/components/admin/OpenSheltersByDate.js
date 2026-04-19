import React, { useEffect, useMemo, useState } from "react";
import { shelterAPI } from "../../api/shelter";
import { serviceShiftAPI } from "../../api/serviceShift";
import "../../styles/admin/OpenSheltersByDate.css";

// Build a stable local-day key (YYYY-MM-DD) for grouping, plus a human-readable label.
const buildDateKey = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (timestamp) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatLocation = (shelter) => {
  const address = shelter.address || shelter;
  const parts = [
    address.street1,
    address.street2,
    address.city,
    address.state,
    address.postal_code,
  ].filter((part) => part && String(part).trim().length > 0);
  return parts.join(", ");
};

const OpenSheltersByDate = () => {
  const [shelters, setShelters] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const [shelterData, shiftData] = await Promise.all([
          shelterAPI.getShelters(),
          serviceShiftAPI.getFutureShifts(),
        ]);
        if (cancelled) return;
        setShelters(Array.isArray(shelterData) ? shelterData : []);
        setShifts(Array.isArray(shiftData) ? shiftData : []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error("Error loading open shelters by date:", err);
        setError("Failed to load open shelters. Please try again later.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const shelterMap = useMemo(() => {
    return shelters.reduce((acc, shelter) => {
      acc[shelter._id || shelter.id] = shelter;
      return acc;
    }, {});
  }, [shelters]);

  // Group shelters by the local date their shifts start on. A shelter is
  // considered "open" on a given date if it has at least one shift starting
  // that day; we de-duplicate per (date, shelter).
  const groupedByDate = useMemo(() => {
    const groups = new Map();
    shifts.forEach((shift) => {
      const shelter = shelterMap[shift.shelter_id];
      if (!shelter) return;
      const dateKey = buildDateKey(shift.shift_start);
      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          dateKey,
          label: formatDateLabel(shift.shift_start),
          sortValue: new Date(`${dateKey}T00:00:00`).getTime(),
          shelters: new Map(),
        });
      }
      const bucket = groups.get(dateKey);
      const shelterId = shelter._id || shelter.id;
      if (!bucket.shelters.has(shelterId)) {
        bucket.shelters.set(shelterId, shelter);
      }
    });
    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        shelters: Array.from(group.shelters.values()).sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        ),
      }))
      .sort((a, b) => b.sortValue - a.sortValue);
  }, [shifts, shelterMap]);

  const totalOpenInstances = useMemo(
    () => groupedByDate.reduce((sum, group) => sum + group.shelters.length, 0),
    [groupedByDate]
  );

  if (isLoading) {
    return (
      <div className="open-shelters-container">
        <h2>Open Shelters by Date</h2>
        <div className="loading">Loading open shelters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="open-shelters-container">
        <h2>Open Shelters by Date</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="open-shelters-container">
      <header className="open-shelters-header">
        <h2>Open Shelters by Date</h2>
        <p className="open-shelters-subtitle">
          Upcoming dates are listed first. Each section shows every shelter open
          on that day.
        </p>
        {groupedByDate.length > 0 && (
          <p className="open-shelters-meta" aria-live="polite">
            {groupedByDate.length} upcoming{" "}
            {groupedByDate.length === 1 ? "date" : "dates"} ·{" "}
            {totalOpenInstances} shelter{" "}
            {totalOpenInstances === 1 ? "opening" : "openings"}
          </p>
        )}
      </header>
      {groupedByDate.length === 0 ? (
        <div className="no-shelters">
          No upcoming open shelters found. Once shelters schedule shifts,
          they'll appear here grouped by date.
        </div>
      ) : (
        <div className="open-shelters-list" role="list">
          {groupedByDate.map((group) => (
            <section
              key={group.dateKey}
              className="date-section"
              role="listitem"
              aria-label={`Shelters open on ${group.label}`}
            >
              <div className="date-header">{group.label}</div>
              <ul className="shelter-entries">
                {group.shelters.map((shelter) => {
                  const id = shelter._id || shelter.id;
                  const location = formatLocation(shelter);
                  return (
                    <li key={id} className="shelter-entry">
                      <div className="shelter-entry-name">
                        {shelter.name || "Unnamed shelter"}
                      </div>
                      {location && (
                        <div className="shelter-entry-location">{location}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpenSheltersByDate;
