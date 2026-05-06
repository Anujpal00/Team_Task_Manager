import express from 'express';
import { body, param } from 'express-validator';
import {
  addMember,
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  removeMember
} from '../controllers/projectController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(
    authorize('Admin'),
    [
      body('name').trim().notEmpty().withMessage('Project name is required').escape(),
      body('description').trim().notEmpty().withMessage('Project description is required').escape(),
      body('members').optional().isArray().withMessage('Members must be an array')
    ],
    validateRequest,
    createProject
  )
  .get(getProjects);

router
  .route('/:id')
  .get(param('id').isMongoId().withMessage('Invalid project id'), validateRequest, getProjectById)
  .delete(
    authorize('Admin'),
    param('id').isMongoId().withMessage('Invalid project id'),
    validateRequest,
    deleteProject
  );

router.post(
  '/:id/add-member',
  authorize('Admin'),
  [
    param('id').isMongoId().withMessage('Invalid project id'),
    body('userId').isMongoId().withMessage('Valid user id is required')
  ],
  validateRequest,
  addMember
);

router.post(
  '/:id/remove-member',
  authorize('Admin'),
  [
    param('id').isMongoId().withMessage('Invalid project id'),
    body('userId').isMongoId().withMessage('Valid user id is required')
  ],
  validateRequest,
  removeMember
);

export default router;
