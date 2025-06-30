// Component for rendering volunteer count info (shared between desktop and mobile)
export const VolunteerCount = ({ shift, inline = false }) => {
  const content = (
    <>
      {shift.volunteers.length} / {shift.required_volunteer_count} required
      {inline ? ' ' : <br />}
      <span className="max-volunteers">
        (max {shift.max_volunteer_count})
      </span>
    </>
  );
  return inline ? <span>{content}</span> : <div>{content}</div>;
};