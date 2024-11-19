import "../../styles/shelter/TodaysShifts.css";

const TodaysShifts = ({ shiftDetails }) => {
  const today = new Date();

  const todayShifts = shiftDetails.filter(
    (shift) => new Date(shift.start_time).toDateString() === today.toDateString()
  );

  todayShifts.length;

  return null; 
};

export default TodaysShifts;



