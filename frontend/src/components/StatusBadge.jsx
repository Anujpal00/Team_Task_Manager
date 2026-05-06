const StatusBadge = ({ status }) => {
  const className = `status-badge status-${status.toLowerCase().replaceAll(' ', '-')}`;
  return <span className={className}>{status}</span>;
};

export default StatusBadge;
