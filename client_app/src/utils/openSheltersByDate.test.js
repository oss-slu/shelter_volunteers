import { getOpenSheltersGroupedByDate } from './openSheltersByDate';

describe('openSheltersByDate helpers', () => {
  const shelters = [
    { _id: 's1', name: 'Alpha Shelter' },
    { _id: 's2', name: 'Bravo Shelter' },
    { _id: 's3', name: 'Charlie Shelter' },
  ];

  it('groups shelters by date in descending order without duplicates for the same day', () => {
    const shifts = [
      { shelter_id: 's1', shift_start: new Date('2026-04-15T09:00:00').getTime() },
      { shelter_id: 's1', shift_start: new Date('2026-04-15T14:00:00').getTime() },
      { shelter_id: 's2', shift_start: new Date('2026-04-15T11:30:00').getTime() },
      { shelter_id: 's3', shift_start: new Date('2026-04-16T08:00:00').getTime() },
      { shelter_id: 's3', shift_start: 'invalid' },
    ];

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

  it('returns an empty array when shelters or shifts are missing', () => {
    expect(getOpenSheltersGroupedByDate(undefined, [])).toEqual([]);
    expect(getOpenSheltersGroupedByDate(shelters, null)).toEqual([]);
  });
});
