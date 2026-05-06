import express from 'express';
import { body, param } from 'express-validator';
import {
  createTask,
  deleteTask,
  getTasksByProject,
  updateTask
} from '../controllers/taskController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('Admin'),
  [
    body('title').trim().notEmpty().withMessage('Task title is required').escape(),
    body('description').trim().notEmpty().withMessage('Task description is required').escape(),
    body('projectId').isMongoId().withMessage('Valid project id is required'),
    body('assignedTo').isMongoId().withMessage('Valid assigned user id is required'),
    body('status').optional().isIn(['To Do', 'In Progress', 'Completed']).withMessage('Invalid status'),
    body('dueDate').isISO8601().withMessage('Valid due date is required')
  ],
  validateRequest,
  createTask
);

router.get(
  '/project/:projectId',
  param('projectId').isMongoId().withMessage('Invalid project id'),
  validateRequest,
  getTasksByProject
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid task id'),
    body('title').optional().trim().notEmpty().withMessage('Task title cannot be empty').escape(),
    body('description').optional().trim().notEmpty().withMessage('Task description cannot be empty').escape(),
    body('assignedTo').optional().isMongoId().withMessage('Valid assigned user id is required'),
    body('status').optional().isIn(['To Do', 'In Progress', 'Completed']).withMessage('Invalid status'),
    body('dueDate').optional().isISO8601().withMessage('Valid due date is required')
  ],
  validateRequest,
  updateTask
);

router.delete(
  '/:id',
  authorize('Admin'),
  param('id').isMongoId().withMessage('Invalid task id'),
  validateRequest,
  deleteTask
);

export default router;
