import React, { useEffect, useMemo, useState } from "react";
import { shelterAPI } from "../../api/shelter";
import "../../styles/admin/OpenSheltersByDate.css";

const formatDateLabel = (dateKey) => {
  // Build a midday Date so DST transitions never flip the displayed weekday.
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString("en-US", {
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
  const [groupedByDate, setGroupedByDate] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const data = await shelterAPI.getOpenSheltersByDate({
          tzOffsetMinutes: new Date().getTimezoneOffset(),
        });
        if (cancelled) return;
        setGroupedByDate(Array.isArray(data) ? data : []);
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

  const totalOpenInstances = useMemo(
    () =>
      groupedByDate.reduce(
        (sum, group) => sum + (group.shelters ? group.shelters.length : 0),
        0
      ),
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
              key={group.date}
              className="date-section"
              role="listitem"
              aria-label={`Shelters open on ${formatDateLabel(group.date)}`}
            >
              <div className="date-header">{formatDateLabel(group.date)}</div>
              <ul className="shelter-entries">
                {(group.shelters || []).map((shelter) => {
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
