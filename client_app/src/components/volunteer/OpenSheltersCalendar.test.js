import { render, screen, waitFor } from '@testing-library/react';
import OpenSheltersCalendar from './OpenSheltersCalendar';
import { shelterAPI } from '../../api/shelter';

jest.mock('../../api/shelter', () => ({
  shelterAPI: {
    getOpenShelters: jest.fn(),
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

  it('renders grouped open shelters from the backend endpoint', async () => {
    shelterAPI.getOpenShelters.mockResolvedValue([
      {
        date: '2026-04-18',
        shelters: [{ _id: 's1', name: 'Shelter One' }],
      },
    ]);

    render(<OpenSheltersCalendar />);

    await waitFor(() =>
      expect(screen.getByText('Upcoming Open Shelters')).toBeInTheDocument()
    );

    expect(shelterAPI.getOpenShelters).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Shelter One')).toBeInTheDocument();
    expect(screen.getByText('1 date listed.')).toBeInTheDocument();
  });

  it('renders an error message when the backend request fails', async () => {
    shelterAPI.getOpenShelters.mockRejectedValue(new Error('Request failed'));

    render(<OpenSheltersCalendar />);

    const alert = await screen.findByRole('alert');

    expect(shelterAPI.getOpenShelters).toHaveBeenCalledTimes(1);
    expect(alert).toHaveTextContent('Unable to Load Shelters');
    expect(alert).toHaveTextContent(
      'We could not load the open shelters list right now. Please try again.'
    );
  });
});
