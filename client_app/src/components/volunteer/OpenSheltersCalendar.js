import { useEffect, useMemo, useState } from 'react';
import { shelterAPI } from '../../api/shelter';
import { serviceShiftAPI } from '../../api/serviceShift';
import Loading from '../Loading';
import { formatDate } from '../../formatting/FormatDateTime';
import { ShelterInfo } from './ShelterInfo';
import { getOpenSheltersGroupedByDate } from '../../utils/openShelterCalendar';
import '../../styles/volunteer/OpenSheltersCalendar.css';

function OpenSheltersCalendar() {
  const [shelters, setShelters] = useState([]);
  const [futureShifts, setFutureShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoadError('');
      try {
        const [shelterData, shiftData] = await Promise.all([
          shelterAPI.getShelters(),
          serviceShiftAPI.getFutureShifts(),
        ]);

        setShelters(shelterData);
        setFutureShifts(shiftData);
      } catch (error) {
        console.error('Error loading open shelters calendar:', error);
        setLoadError('We could not load the open shelters list right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

  const openShelterGroups = useMemo(
    () => getOpenSheltersGroupedByDate(shelters, futureShifts),
    [futureShifts, shelters]
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <section className="open-shelters-calendar">
      <div className="open-shelters-calendar__header">
        <h1 className="title-small">Open Shelters List</h1>
        <p className="tagline-small">
          Browse upcoming open shelters grouped by date in descending order.
        </p>
      </div>
      {loadError && (
        <div className="open-shelters-calendar__error" role="alert">
          <h2 className="open-shelters-calendar__results-title">Unable to Load Shelters</h2>
          <p className="tagline-small">{loadError}</p>
        </div>
      )}
      {!loadError && (
      <div className="open-shelters-calendar__results open-shelters-calendar__results--list">
        <h2 className="open-shelters-calendar__results-title">Upcoming Open Shelters</h2>
        <p className="tagline-small">
          {openShelterGroups.length === 0
            ? 'No upcoming open shelters are currently scheduled.'
            : `${openShelterGroups.length} date${openShelterGroups.length === 1 ? '' : 's'} listed.`}
        </p>
        <div className="open-shelters-calendar__groups">
          {openShelterGroups.map((group) => (
            <section key={group.date.toISOString()} className="open-shelters-calendar__group">
              <div className="open-shelters-calendar__group-header">
                <h3 className="open-shelters-calendar__group-title">{formatDate(group.date)}</h3>
                <span className="open-shelters-calendar__group-count">
                  {group.shelters.length} shelter{group.shelters.length === 1 ? '' : 's'} open
                </span>
              </div>
              <div className="open-shelters-calendar__cards">
                {group.shelters.map((shelter) => (
                  <article key={`${group.date.toISOString()}-${shelter._id}`} className="open-shelters-calendar__card">
                    <ShelterInfo shelter={shelter} showLocation={Boolean(shelter?.address)} />
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      )}
    </section>
  );
}

export default OpenSheltersCalendar;
