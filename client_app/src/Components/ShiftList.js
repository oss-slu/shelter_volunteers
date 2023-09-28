const ShiftList = (props) => {
    console.log(props.shifts);
    console.log(typeof props.shifts);
    return (
        <div>
          {/* Display the shift*/} 
   	    {props.shifts && props.shifts.map(shift =>{
            return (
              <div key={shift.code}>
                <h2> {shift.shelter} </h2>
                <p> { shift.worker} </p>
                <p> { shift.time_start} - {shift.time_end} </p>
    	        <hr/>
              </div>
            )
            
            })}
        </div>
        )
}

export default ShiftList;
