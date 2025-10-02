import PastVolunteers from "./PastVolunteers";

const PastVolunteersContainer = ({shiftDetails}) => {
  return (
    <>
      {shiftDetails &&  (
        <div className="past-volunteers-container">
          <PastVolunteers shiftDetails={shiftDetails} />
        </div>
      )}
    </>
  );
}

export default PastVolunteersContainer;
