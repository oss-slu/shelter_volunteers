import Roster from "./Roster";

const ShiftContainer = ({shiftDetails}) => {
  return (
    <>
      {shiftDetails &&  (
        <div className="shift-container">
          <Roster shiftDetails={shiftDetails} />
        </div>
      )}
    </>
  );
}

export default ShiftContainer;
