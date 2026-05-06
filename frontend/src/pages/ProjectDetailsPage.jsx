import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [removingMemberId, setRemovingMemberId] = useState('');

  const loadProject = async () => {
    const [{ project: loadedProject }, { tasks: loadedTasks }] = await Promise.all([
      api.project(id),
      api.tasksByProject(id)
    ]);
    setProject(loadedProject);
    setTasks(loadedTasks);
  };

  useEffect(() => {
    loadProject().catch((loadError) => setError(loadError.message));
    if (isAdmin) {
      api.users().then(({ users: userList }) => setUsers(userList)).catch(() => {});
    }
  }, [id, isAdmin]);

  const addMember = async () => {
    if (!selectedUser) return;
    setError('');
    setSuccess('');

    try {
      await api.addMember(id, selectedUser);
      setSelectedUser('');
      setSuccess('Member added to project.');
      await loadProject();
    } catch (addError) {
      setError(addError.message);
    }
  };

  const removeMember = async (member) => {
    const confirmed = window.confirm(`Remove ${member.name} from this project? Their tasks will be reassigned.`);
    if (!confirmed) return;

    setError('');
    setSuccess('');
    setRemovingMemberId(member._id);

    try {
      const response = await api.removeMember(id, member._id);
      const taskText =
        response.reassignedTaskCount > 0
          ? ` ${response.reassignedTaskCount} task${response.reassignedTaskCount === 1 ? '' : 's'} reassigned.`
          : '';
      setSuccess(`${member.name} removed from project.${taskText}`);
      await loadProject();
    } catch (removeError) {
      setError(removeError.message);
    } finally {
      setRemovingMemberId('');
    }
  };

  if (!project) {
    return <div className="screen-message">{error || 'Loading project...'}</div>;
  }

  const availableUsers = users.filter((teamUser) => !project.members.some((member) => member._id === teamUser._id));

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>{project.name}</h2>
          <p>{project.description}</p>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <div className="two-column">
        <article className="content-panel">
          <h3>Existing members</h3>
          <div className="member-list">
            {project.members.map((member) => (
              <div key={member._id}>
                <span>
                  {member.name}
                  {project.createdBy?._id === member._id && <small className="creator-tag">Creator</small>}
                </span>
                <small>{member.email} · {member.role}</small>
                {isAdmin && (
                  <button
                    className="text-danger"
                    disabled={project.createdBy?._id === member._id || removingMemberId === member._id}
                    onClick={() => removeMember(member)}
                    title={
                      project.createdBy?._id === member._id
                        ? 'Project creator cannot be removed'
                        : `Remove ${member.name}`
                    }
                  >
                    {removingMemberId === member._id ? 'Removing...' : 'Remove'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {isAdmin && (
            <div className="inline-form">
              <select value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)}>
                <option value="">Add member</option>
                {availableUsers.map((teamUser) => (
                  <option key={teamUser._id} value={teamUser._id}>
                    {teamUser.name} ({teamUser.role})
                  </option>
                ))}
              </select>
              <button onClick={addMember}>Add</button>
            </div>
          )}
        </article>

        <article className="content-panel">
          <h3>Tasks</h3>
          <div className="task-list">
            {tasks.map((task) => (
              <div className="task-row" key={task._id}>
                <div>
                  <strong>{task.title}</strong>
                  <small>{task.assignedTo?.name}</small>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
};

export default ProjectDetailsPage;
