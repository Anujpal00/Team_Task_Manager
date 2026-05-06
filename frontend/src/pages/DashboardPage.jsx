import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import { api } from '../services/api.js';

const statuses = ['To Do', 'In Progress', 'Completed'];

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { projects: projectList } = await api.projects();
        const taskResponses = await Promise.all(projectList.map((project) => api.tasksByProject(project._id)));
        setProjects(projectList);
        setTasks(taskResponses.flatMap((response) => response.tasks));
      } catch (loadError) {
        setError(loadError.message);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const completed = tasks.filter((task) => task.status === 'Completed').length;
    const overdue = tasks.filter((task) => task.status !== 'Completed' && new Date(task.dueDate) < now).length;

    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
      overdue
    };
  }, [tasks]);

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>{projects.length} active project{projects.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="stats-grid">
        <article>
          <span>Total tasks</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </article>
        <article>
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </article>
        <article>
          <span>Overdue</span>
          <strong>{stats.overdue}</strong>
        </article>
      </div>

      <div className="status-columns">
        {statuses.map((status) => (
          <article className="task-column" key={status}>
            <h3>{status}</h3>
            {tasks
              .filter((task) => task.status === status)
              .map((task) => (
                <div className="task-card" key={task._id}>
                  <div>
                    <strong>{task.title}</strong>
                    <StatusBadge status={task.status} />
                  </div>
                  <p>{task.description}</p>
                  <small>Due {new Date(task.dueDate).toLocaleDateString()}</small>
                </div>
              ))}
          </article>
        ))}
      </div>
    </section>
  );
};

export default DashboardPage;
