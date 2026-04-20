import { render, screen, waitFor } from '@testing-library/react';
import OpenSheltersCalendar from './OpenSheltersCalendar';
import { shelterAPI } from '../../api/shelter';
import { serviceShiftAPI } from '../../api/serviceShift';

jest.mock('../../api/shelter', () => ({
  shelterAPI: {
    getShelters: jest.fn(),
  },
}));

jest.mock('../../api/serviceShift', () => ({
  serviceShiftAPI: {
    getFutureShifts: jest.fn(),
  },
}));

jest.mock('../Loading', () => () => <div>Loading...</div>);

jest.mock('./ShelterInfo', () => ({
  ShelterInfo: ({ shelter }) => <div>{shelter.name}</div>,
}));

describe('OpenSheltersCalendar', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders grouped open shelters from shelter and shift data', async () => {
    shelterAPI.getShelters.mockResolvedValue([
      { _id: 's1', name: 'Shelter One' },
    ]);
    serviceShiftAPI.getFutureShifts.mockResolvedValue([
      { shelter_id: 's1', shift_start: new Date('2026-04-18T08:00:00').getTime() },
    ]);

    render(<OpenSheltersCalendar />);

    await waitFor(() =>
      expect(screen.getByText('Upcoming Open Shelters')).toBeInTheDocument()
    );

    expect(shelterAPI.getShelters).toHaveBeenCalledTimes(1);
    expect(serviceShiftAPI.getFutureShifts).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Shelter One')).toBeInTheDocument();
    expect(screen.getByText('1 date listed.')).toBeInTheDocument();
  });

  it('renders an error message when the backend request fails', async () => {
    shelterAPI.getShelters.mockRejectedValue(new Error('Request failed'));
    serviceShiftAPI.getFutureShifts.mockResolvedValue([]);

    render(<OpenSheltersCalendar />);

    const alert = await screen.findByRole('alert');

    expect(shelterAPI.getShelters).toHaveBeenCalledTimes(1);
    expect(alert).toHaveTextContent('Unable to Load Shelters');
    expect(alert).toHaveTextContent(
      'We could not load the open shelters list right now. Please try again.'
    );
  });
});
