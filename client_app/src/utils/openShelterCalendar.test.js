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

  it('returns an empty array when shelters are null or undefined', () => {
    expect(getOpenSheltersForDate(null, shifts, new Date('2026-04-15T10:00:00'))).toEqual([]);
    expect(getOpenSheltersGroupedByDate(undefined, shifts)).toEqual([]);
  });

  it('returns an empty set or array when shifts are empty', () => {
    expect(Array.from(getOpenShelterIdsForDate([], new Date('2026-04-15T10:00:00')))).toEqual([]);
    expect(getOpenSheltersGroupedByDate(shelters, [])).toEqual([]);
  });

  it('includes shelters whose shifts start at the exact day boundaries', () => {
    const boundaryShifts = [
      { shelter_id: 's1', shift_start: new Date('2026-04-20T00:00:00').getTime() },
      { shelter_id: 's2', shift_start: new Date('2026-04-20T23:59:59.999').getTime() },
      { shelter_id: 's3', shift_start: new Date('2026-04-21T00:00:00').getTime() },
    ];

    const openShelterIds = getOpenShelterIdsForDate(
      boundaryShifts,
      new Date('2026-04-20T12:00:00')
    );

    expect(Array.from(openShelterIds)).toEqual(['s1', 's2']);
  });

  it('deduplicates repeated shelter ids for the same day', () => {
    const duplicateShifts = [
      { shelter_id: 's1', shift_start: new Date('2026-04-22T08:00:00').getTime() },
      { shelter_id: 's1', shift_start: new Date('2026-04-22T12:00:00').getTime() },
      { shelter_id: 's1', shift_start: new Date('2026-04-22T16:00:00').getTime() },
    ];

    const groupedShelters = getOpenSheltersGroupedByDate(shelters, duplicateShifts);

    expect(groupedShelters).toHaveLength(1);
    expect(groupedShelters[0].shelters).toEqual([{ _id: 's1', name: 'Alpha Shelter' }]);
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

  it('handles larger datasets while preserving descending date order', () => {
    const largeShifts = Array.from({ length: 120 }, (_, index) => ({
      shelter_id: shelters[index % shelters.length]._id,
      shift_start: new Date(
        `2026-05-${String((index % 20) + 1).padStart(2, '0')}T08:00:00`
      ).getTime(),
    }));

    const groupedShelters = getOpenSheltersGroupedByDate(shelters, largeShifts);

    expect(groupedShelters).toHaveLength(20);
    expect(groupedShelters[0].date.getTime()).toBeGreaterThan(groupedShelters[1].date.getTime());
    expect(groupedShelters[19].date.getTime()).toBeLessThan(groupedShelters[0].date.getTime());
  });
});
