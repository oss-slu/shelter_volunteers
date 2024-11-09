import ProcessVolunteerList from "./ProcessVolunteerList";

const AllVolunteers = ({shiftDetails}) => {
    return (
      <>
        {shiftDetails &&  (
        <div>
          <ProcessVolunteerList shiftDetails={shiftDetails} />
        </div>
      )}
      </>
    );
}

export default AllVolunteers;