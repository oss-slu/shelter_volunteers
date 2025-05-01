export const Address = ({ address }) => {
  return (
    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${address.street1}, ${address.street2 ? 
        address.street2 + ', ' : ''}${address.city}, 
        ${address.state} ${address.postalCode}`
      )}`}
        target="_blank" 
        rel="noopener noreferrer"
      >
      {address.street1}
      {address.street2 && `, ${address.street2}`}
      <br />
      {address.city}, {address.state} {address.postalCode}
    </a>
  );
}