import { Address } from './Address';

export const ShelterInfo = ({ shelter, showLocation = true }) => (
  <>
    <div className="shelter-name">{shelter?.name}</div>
    {showLocation && (
      <div className="shelter-location">
        <Address address={shelter.address}/>
      </div>
    )}
  </>
);