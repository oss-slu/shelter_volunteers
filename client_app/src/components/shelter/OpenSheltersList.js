import { useEffect, useMemo, useState } from 'react';
import { shelterAPI } from '../../api/shelter';
import { serviceShiftAPI } from '../../api/serviceShift';
import Loading from '../Loading';
import { formatDate } from '../../formatting/FormatDateTime';
import { ShelterInfo } from '../volunteer/ShelterInfo';
import { getOpenSheltersGroupedByDate, toDateKey } from '../../utils/openSheltersByDate';
import '../../styles/shelter/OpenSheltersList.css';

function OpenSheltersList() {
  const [shelters, setShelters] = useState([]);
  const [futureShifts, setFutureShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchOpenShelters = async () => {
      if (isMounted) {
        setLoadError('');
      }
      try {
        const [shelterData, shiftData] = await Promise.all([
          shelterAPI.getShelters(),
          serviceShiftAPI.getFutureShifts(),
        ]);
        if (isMounted) {
          setShelters(shelterData);
          setFutureShifts(shiftData);
        }
      } catch (error) {
        console.error('Error loading shelter dashboard open shelters list:', error);
        if (isMounted) {
          setLoadError('We could not load the open shelters list right now. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOpenShelters();

    return () => {
      isMounted = false;
    };
  }, []);

  const openShelterGroups = useMemo(
    () => getOpenSheltersGroupedByDate(shelters, futureShifts),
    [futureShifts, shelters]
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <section className="shelter-open-list">
      <div className="shelter-open-list__header">
        <h1 className="title-small">Open Shelters List</h1>
        <p className="tagline-small">
          Browse upcoming open shelters grouped by date in descending order.
        </p>
      </div>
      {loadError && (
        <div className="shelter-open-list__error" role="alert">
          <h2 className="shelter-open-list__results-title">Unable to Load Shelters</h2>
          <p className="tagline-small">{loadError}</p>
        </div>
      )}
      {!loadError && (
        <div className="shelter-open-list__results shelter-open-list__results--list">
          <h2 className="shelter-open-list__results-title">Upcoming Open Shelters</h2>
          <p className="tagline-small">
            {openShelterGroups.length === 0
              ? 'No upcoming open shelters are currently scheduled.'
              : `${openShelterGroups.length} date${openShelterGroups.length === 1 ? '' : 's'} listed.`}
          </p>
          <div className="shelter-open-list__groups">
            {openShelterGroups.map((group) => (
              <section key={toDateKey(group.date)} className="shelter-open-list__group">
                <div className="shelter-open-list__group-header">
                  <h3 className="shelter-open-list__group-title">{formatDate(group.date)}</h3>
                  <span className="shelter-open-list__group-count">
                    {group.shelters.length} shelter{group.shelters.length === 1 ? '' : 's'} open
                  </span>
                </div>
                <div className="shelter-open-list__cards">
                  {group.shelters.map((shelter) => (
                    <article
                      key={`${group.date.toISOString()}-${shelter._id}`}
                      className="shelter-open-list__card"
                    >
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

export default OpenSheltersList;
