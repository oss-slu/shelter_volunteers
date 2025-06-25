import { formatDate } from '../../formatting/FormatDateTime';
import { formatTime } from '../../formatting/FormatDateTime';
import { Address } from './Address';

const SignUpResults = ({ results, shifts, shelterMap }) => {
  console.log('SignUpResults:', results, shifts, shelterMap);
  // Process shift data for rendering (eliminates duplication)
  const processResultData = (index) => {
    const shift = shifts[index];
    const shelter = shelterMap[shift.shelter_id];
    const startDate = formatDate(shift.shift_start);
    const startTime = formatTime(shift.shift_start);
    const endTime = formatTime(shift.shift_end);
    const duration = Math.round((shift.shift_end - shift.shift_start) / (1000 * 60 * 60));
    const message = results[index].success? 'Success' : results[index].message;
    const success = results[index].success;
    return {
      shift,
      shelter,
      startDate,
      startTime,
      endTime,
      duration,
      message,
      success
    };
  };

  // Component for rendering shelter info (shared between desktop and mobile)
  const ShelterInfo = ({ shelter, showLocation = true }) => (
    <>
      <div className="shelter-name">{shelter?.name}</div>
      {showLocation && (
        <div className="shelter-location">
          <Address address={shelter.address}/>
        </div>
      )}
    </>
  );


  // Desktop table row component
  const DesktopShiftRow = ({ resultData }) => (
    <tr 
      key={resultData.shift._id} 
      className='table-row'
    >
      <td>
        <ShelterInfo shelter={resultData.shelter} />
      </td>
      <td>{resultData.startDate}</td>
      <td>{resultData.startTime}</td>
      <td>{resultData.duration}h</td>
      <td>{resultData.success? (
        <span className="success">Success</span>
        ):(
          <div className="error-message">
            <span >Failure: </span>
            <span> {resultData.message} </span>
          </div>
        )}
      </td>
    </tr>
  );
  // Mobile card component
  const MobileShiftCard = ({ resultData }) => (
    <div 
      key={resultData.shift._id} 
      className='dashboard-button table-row'
    >
      <div className="card-header">
        <div className="card-title">
          <ShelterInfo shelter={resultData.shelter} showLocation={true} />
        </div>
      </div>       
      <div className="card-details">
        <div className="detail-row">
          <span className="detail-label">Date:</span>
          <span>{resultData.startDate}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Time:</span>
          <span>{resultData.startTime} - {resultData.endTime} ({resultData.duration}h)</span>
        </div>
        {resultData.success ? (
          <div className="detail-row success">
            <span> Success </span>
          </div>) : (
            <div className="detail-row error-message">
              <span >Failure: {resultData.message}</span>
            </div>
          )
        }
      </div>

    </div>
  );

return (
  <div>
    <h1 className="title-small">Sign Up Results</h1>
    {/* Desktop Table View */}
    <div className="table-container desktop-only">
      <table className="shifts-table">
        <thead>
          <tr className="table-header">
            <th>Shelter</th>
            <th>Date</th>
            <th>Time</th>
            <th>Duration</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <DesktopShiftRow key={index} resultData={processResultData(index)} />
          ))}
        </tbody>
      </table>
    </div>
    {/* Mobile Card View */}
    <div className="cards-container mobile-only">
      {results.map((result, index) => (
        <MobileShiftCard key={index} resultData={processResultData(index)} />
      ))}
    </div>
  </div>
);
};

export default SignUpResults;