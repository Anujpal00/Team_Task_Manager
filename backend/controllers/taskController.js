import Project from '../models/Project.js';
import Task from '../models/Task.js';

const taskPopulate = [
  { path: 'assignedTo', select: 'name email role' },
  { path: 'projectId', select: 'name description members' }
];

export const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, status, dueDate } = req.body;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.members.some((memberId) => memberId.equals(assignedTo))) {
      return res.status(400).json({ message: 'Assigned user must be a project member' });
    }

    const task = await Task.create({ title, description, projectId, assignedTo, status, dueDate });
    await task.populate(taskPopulate);
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

export const getTasksByProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some((memberId) => memberId.equals(req.user._id));
    if (req.user.role !== 'Admin' && !isMember) {
      return res.status(403).json({ message: 'You can only view tasks for assigned projects' });
    }

    const query =
      req.user.role === 'Admin'
        ? { projectId: project._id }
        : { projectId: project._id, assignedTo: req.user._id };

    const tasks = await Task.find(query).populate(taskPopulate).sort({ dueDate: 1 });
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'Member') {
      if (!task.assignedTo.equals(req.user._id)) {
        return res.status(403).json({ message: 'Members can only update their own tasks' });
      }

      if (!req.body.status) {
        return res.status(400).json({ message: 'Members can only update task status' });
      }

      task.status = req.body.status;
    } else {
      const allowedFields = ['title', 'description', 'assignedTo', 'status', 'dueDate'];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) task[field] = req.body[field];
      });

      if (req.body.assignedTo) {
        const project = await Project.findById(task.projectId);
        if (!project.members.some((memberId) => memberId.equals(req.body.assignedTo))) {
          return res.status(400).json({ message: 'Assigned user must be a project member' });
        }
      }
    }

    await task.save();
    await task.populate(taskPopulate);
    res.json({ task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};
