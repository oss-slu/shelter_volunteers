const ShiftList = (props) => {
    console.log(props.shifts);
    console.log("HERE");
    console.log(typeof props.shifts);
    return (
        <div>
          {/* Display the shift*/} 
   	    {props.shifts && props.shifts.map(shift =>{
            return (
              <div key={shift.id}>
                <h2> {shift.shelter} </h2>
                <p> { shift.date} </p>
                <p> { shift.time_start} - {shift.time_end} </p>
    	        <hr/>
              </div>
            )
            
            })}
        </div>
        )
}

export default ShiftList;
