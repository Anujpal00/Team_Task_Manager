import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

const projectPopulate = [
  { path: 'createdBy', select: 'name email role' },
  { path: 'members', select: 'name email role' }
];

export const createProject = async (req, res, next) => {
  try {
    const { name, description, members = [] } = req.body;
    const uniqueMembers = [...new Set([req.user._id.toString(), ...members])];
    const memberCount = await User.countDocuments({ _id: { $in: uniqueMembers } });

    if (memberCount !== uniqueMembers.length) {
      return res.status(400).json({ message: 'One or more members do not exist' });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: uniqueMembers
    });

    await project.populate(projectPopulate);
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const query = req.user.role === 'Admin' ? {} : { members: req.user._id };
    const projects = await Project.find(query).populate(projectPopulate).sort({ createdAt: -1 });
    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(projectPopulate);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some((member) => member._id.equals(req.user._id));
    if (req.user.role !== 'Admin' && !isMember) {
      return res.status(403).json({ message: 'You can only view assigned projects' });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();
    res.json({ message: 'Project and related tasks deleted' });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const [project, user] = await Promise.all([
      Project.findById(req.params.id),
      User.findById(userId)
    ]);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!project.members.some((memberId) => memberId.equals(user._id))) {
      project.members.push(user._id);
      await project.save();
    }

    await project.populate(projectPopulate);
    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isProjectMember = project.members.some((memberId) => memberId.equals(userId));
    if (!isProjectMember) {
      return res.status(400).json({ message: 'User is not a member of this project' });
    }

    if (project.createdBy.equals(userId)) {
      return res.status(400).json({ message: 'Project creator cannot be removed from the project' });
    }

    project.members = project.members.filter((memberId) => !memberId.equals(userId));
    await project.save();
    const reassignedTasks = await Task.updateMany(
      { projectId: project._id, assignedTo: userId },
      { assignedTo: project.createdBy }
    );
    await project.populate(projectPopulate);

    res.json({
      project,
      message: 'Member removed from project',
      reassignedTaskCount: reassignedTasks.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};
