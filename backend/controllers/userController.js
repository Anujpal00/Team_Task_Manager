import User from '../models/User.js';

export const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};

export const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select('name email role').sort({ name: 1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};
