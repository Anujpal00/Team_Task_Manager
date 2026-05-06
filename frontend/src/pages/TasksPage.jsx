import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

const statuses = ['To Do', 'In Progress', 'Completed'];

const TasksPage = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'To Do',
    dueDate: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .projects()
      .then(({ projects: projectList }) => {
        setProjects(projectList);
        if (projectList[0]) setSelectedProjectId(projectList[0]._id);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    api
      .tasksByProject(selectedProjectId)
      .then(({ tasks: loadedTasks }) => setTasks(loadedTasks))
      .catch((loadError) => setError(loadError.message));
  }, [selectedProjectId]);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const createTask = async (event) => {
    event.preventDefault();
    await api.createTask({ ...form, projectId: selectedProjectId });
    setForm({ title: '', description: '', assignedTo: '', status: 'To Do', dueDate: '' });
    const { tasks: loadedTasks } = await api.tasksByProject(selectedProjectId);
    setTasks(loadedTasks);
  };

  const updateStatus = async (taskId, status) => {
    const { task } = await api.updateTask(taskId, { status });
    setTasks((current) => current.map((item) => (item._id === taskId ? task : item)));
  };

  const deleteTask = async (taskId) => {
    await api.deleteTask(taskId);
    setTasks((current) => current.filter((task) => task._id !== taskId));
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Tasks</h2>
          <p>{isAdmin ? 'Assign and track project work' : 'Update your assigned work'}</p>
        </div>
        <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error-text">{error}</p>}

      {isAdmin && selectedProject && (
        <form className="panel-form" onSubmit={createTask}>
          <h3>New task</h3>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            required
          />
          <div className="form-grid">
            <select
              value={form.assignedTo}
              onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}
              required
            >
              <option value="">Assign to</option>
              {selectedProject.members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
              required
            />
          </div>
          <button>Create task</button>
        </form>
      )}

      <div className="task-table">
        {tasks.map((task) => (
          <article className="task-table-row" key={task._id}>
            <div>
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              <small>Assigned to {task.assignedTo?.name} · Due {new Date(task.dueDate).toLocaleDateString()}</small>
            </div>
            <StatusBadge status={task.status} />
            <select value={task.status} onChange={(event) => updateStatus(task._id, event.target.value)}>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            {isAdmin && (
              <button className="danger-button" onClick={() => deleteTask(task._id)}>
                Delete
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default TasksPage;
