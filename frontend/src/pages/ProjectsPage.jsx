import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

const ProjectsPage = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', members: [] });
  const [error, setError] = useState('');

  const loadProjects = async () => {
    const { projects: projectList } = await api.projects();
    setProjects(projectList);
  };

  useEffect(() => {
    loadProjects().catch((loadError) => setError(loadError.message));
    if (isAdmin) {
      api.users().then(({ users: userList }) => setUsers(userList)).catch(() => {});
    }
  }, [isAdmin]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await api.createProject(form);
      setForm({ name: '', description: '', members: [] });
      await loadProjects();
    } catch (createError) {
      setError(createError.message);
    }
  };

  const toggleMember = (userId) => {
    setForm((current) => ({
      ...current,
      members: current.members.includes(userId)
        ? current.members.filter((id) => id !== userId)
        : [...current.members, userId]
    }));
  };

  const deleteProject = async (projectId) => {
    await api.deleteProject(projectId);
    await loadProjects();
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Projects</h2>
          <p>{isAdmin ? 'Create projects and manage teams' : 'Projects assigned to you'}</p>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {isAdmin && (
        <form className="panel-form" onSubmit={handleSubmit}>
          <h3>New project</h3>
          <input
            placeholder="Project name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            required
          />
          <div className="checkbox-grid">
            {users.map((teamUser) => (
              <label key={teamUser._id}>
                <input
                  type="checkbox"
                  checked={form.members.includes(teamUser._id)}
                  onChange={() => toggleMember(teamUser._id)}
                />
                {teamUser.name} ({teamUser.role})
              </label>
            ))}
          </div>
          <button>Create project</button>
        </form>
      )}

      <div className="project-grid">
        {projects.map((project) => (
          <article className="project-card" key={project._id}>
            <div>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </div>
            <small>{project.members.length} member{project.members.length === 1 ? '' : 's'}</small>
            <div className="card-actions">
              <Link className="text-button" to={`/projects/${project._id}`}>
                Open
              </Link>
              {isAdmin && (
                <button className="danger-button" onClick={() => deleteProject(project._id)}>
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProjectsPage;
