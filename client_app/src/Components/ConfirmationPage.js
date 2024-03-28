import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const handleReload = () => {
    window.location.reload();
};


const ConfirmationPage = ({ selectedShifts, shiftStatusList }) => {
  return (
    <>
      <div className="conf-page">
        <h1>Shift Registration</h1>
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
              <th>
                <h2>Status</h2>
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedShifts.map((shift, index) => (
              <tr key={shift.code}>
                <td>
                  <p>{shift.shelter}</p>
                </td>
                <td>
                  <p>{format(shift.start_time, 'MMM, dd, yyyy HH:mm aa')}</p>
                </td>
                <td>
                  <p>{format(shift.end_time, 'MMM, dd, yyyy HH:mm aa')}</p>
                </td>
                <td>
                  <p className={shiftStatusList[index] ? 'success' : 'failure'}>
                    {shiftStatusList[index] ? (
                      <>
                        Success
                        <IconButton>
                          <CheckCircleIcon className="check-icon" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                       Failure &nbsp;
                       <Tooltip title="Shift conflict exists" followCursor>
                       <IconButton>
                          <InfoIcon className="info-icon" />
                        </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </p>
                </td>  
              </tr>
            ))}
          </tbody>
        </table>
        <br/>
        <div className="button-row">
          <Link to="/">
            <button>Your Dashboard</button>
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
