const ShelterList = (props) => {
  return (
    <div>
      {/* Display the shift*/}
      {props.shelters &&
        props.shelters.map((shelter) => {
          return (
            <div class="shift text-center" key={shelter.id}>
              <h2>{shelter.name}</h2>
              <p>
                {shelter.city}, {shelter.state} {shelter.zipCode}
              </p>
              <hr />
            </div>
          );
        })}
    </div>
  );
};

export default ShelterList;
