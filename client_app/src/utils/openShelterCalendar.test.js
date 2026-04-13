import {
  getOpenShelterIdsForDate,
  getOpenSheltersForDate,
  getOpenSheltersGroupedByDate,
} from './openShelterCalendar';

describe('openShelterCalendar helpers', () => {
  const shelters = [
    { _id: 's1', name: 'Alpha Shelter' },
    { _id: 's2', name: 'Bravo Shelter' },
    { _id: 's3', name: 'Charlie Shelter' },
  ];

  const shifts = [
    { shelter_id: 's1', shift_start: new Date('2026-04-15T09:00:00').getTime() },
    { shelter_id: 's1', shift_start: new Date('2026-04-15T14:00:00').getTime() },
    { shelter_id: 's2', shift_start: new Date('2026-04-15T11:30:00').getTime() },
    { shelter_id: 's3', shift_start: new Date('2026-04-16T08:00:00').getTime() },
    { shelter_id: 's3', shift_start: 'invalid' },
  ];

  it('returns unique shelter ids open on a selected day', () => {
    const openShelterIds = getOpenShelterIdsForDate(shifts, new Date('2026-04-15T18:00:00'));

    expect(Array.from(openShelterIds)).toEqual(['s1', 's2']);
  });

  it('returns only shelters open on the selected day', () => {
    const openShelters = getOpenSheltersForDate(shelters, shifts, new Date('2026-04-16T10:00:00'));

    expect(openShelters).toEqual([{ _id: 's3', name: 'Charlie Shelter' }]);
  });

  it('returns an empty array when no shelters are open on the selected day', () => {
    const openShelters = getOpenSheltersForDate(shelters, shifts, new Date('2026-04-18T10:00:00'));

    expect(openShelters).toEqual([]);
  });

  it('groups shelters by date in descending order without duplicates for the same day', () => {
    const groupedShelters = getOpenSheltersGroupedByDate(shelters, shifts);

    expect(groupedShelters).toHaveLength(2);
    expect(groupedShelters[0].date.toISOString()).toContain('2026-04-16');
    expect(groupedShelters[0].shelters).toEqual([{ _id: 's3', name: 'Charlie Shelter' }]);
    expect(groupedShelters[1].date.toISOString()).toContain('2026-04-15');
    expect(groupedShelters[1].shelters).toEqual([
      { _id: 's1', name: 'Alpha Shelter' },
      { _id: 's2', name: 'Bravo Shelter' },
    ]);
  });
});
