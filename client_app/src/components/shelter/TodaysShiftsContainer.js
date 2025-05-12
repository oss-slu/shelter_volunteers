import TodaysShifts from "./TodaysShifts";

const TodaysShiftsContainer = ({ shiftDetails }) => {
  return (
    <>
      {shiftDetails && (
        <div className="todays-shifts-container">
          <TodaysShifts shiftDetails={shiftDetails} />
        </div>
      )}
    </>
  );
};

export default TodaysShiftsContainer;