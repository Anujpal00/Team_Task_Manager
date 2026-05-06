import express from 'express';
import { getMe, getUsers } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMe);
router.get('/', protect, authorize('Admin'), getUsers);

export default router;
