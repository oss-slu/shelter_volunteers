const ShelterList = (props) => {
    console.log(props.shelters);
    console.log("HERE");
    console.log(typeof props.shelters);
    return (
        <div>
          {/* Display the shelter*/} 
   	    {props.shelters && props.shelters.map(shelter =>{
            return (
              <div key={shelter.id}>
                <h2> { shelter.name} </h2>
                <p> { shelter.location} </p>
    	        <hr/>
              </div>
            )
            
            })}
        </div>
        )
}

export default ShelterList;
