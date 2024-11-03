import React from "react";
import "../../styles/shelter/UpcomingRequests.css";

const UpcomingRequests = (props)  => {
  return (
    <div className="actions">
      <button>Edit Request</button>
      <button>Cancel Request</button>
      <button>Notify Frequent Volunteers</button>
    </div>
  );
}
// const UpcomingRequests = ({ shifts }) => {
//   return (
//     <div className="upcoming-requests">
//       <h2>All Upcoming Requests</h2>
//       {shifts.map((dateGroup, index) => (
//         <div key={index} className="date-section">
//           <h3>{dateGroup.date}</h3>
//           <div className="shift-rows">
//             {dateGroup.shifts.map((shift, i) => (
//               <div key={i} className="shift-row">
//                 <div className="shift-time">
//                   <p>From Time: {shift.fromTime}</p>
//                   <p>To Time: {shift.toTime}</p>
//                 </div>
//                 <div className="volunteers-requested">
//                   <p>Number of Volunteers Requested: {shift.volunteersRequested}</p> 
//                 </div>
//                 <div className="actions">
//                   <button>Edit Request</button>
//                   <button>Cancel Request</button>
//                   <button>Notify Frequent Volunteers</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

export default UpcomingRequests;
