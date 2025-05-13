import ProcessTodaysShiftsList from "./ProcessTodaysShiftsLists";

const AllTodaysShifts = ({shiftDetails}) => {
    return (
      <>
        {shiftDetails &&  (
        <div>
          <ProcessTodaysShiftsList shiftDetails={shiftDetails} />
        </div>
      )}
      </>
    );
}

export default AllTodaysShifts;