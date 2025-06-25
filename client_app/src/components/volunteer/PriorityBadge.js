export const PriorityBadge = ({ priority }) => {
  let needClass;
  if (priority === 'High') {
    needClass = 'need-high';
  } else if (priority === 'Medium') {
    needClass = 'need-medium';
  } else {
    needClass = 'need-low';
  }
  console.log('priority', priority, needClass);
  return (
    <div className={`need-badge ${needClass}`}>
      {priority}
    </div>
  );
};