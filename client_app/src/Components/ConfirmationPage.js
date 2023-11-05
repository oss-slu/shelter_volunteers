import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const handleReload = () => {
    window.location.reload();
  };

const ConfirmationPage = ({ selectedShifts }) => {
  return (
    <>
      <div className="conf-page">
        <h1>Thank you for registering to volunteer!</h1>
        <table>
          <thead>
            <tr>
              <th>
                <h2>Shelter</h2>
              </th>
              <th>
                <h2>From</h2>
              </th>
              <th>
                <h2>To</h2>
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedShifts.map(shift => (
              <tr key={shift.id}>
                <td>
                  <p>{shift.shelter}</p>
                </td>
                <td>
                  <p>{format(shift.start_time, 'MMM, dd, yyyy HH:mm aa')}</p>
                </td>
                <td>
                  <p>{format(shift.end_time, 'MMM, dd, yyyy HH:mm aa')}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <br/>
        <div className="button-row">
          <Link to="/">
            <button>Dashboard</button>
          </Link>
          <Link 
          to="/shelters"
          onClick={handleReload}>
            <button>Register for more shifts</button>
          </Link>
          <Link to="/upcoming-shifts">
            <button>See all upcoming shifts</button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ConfirmationPage;
