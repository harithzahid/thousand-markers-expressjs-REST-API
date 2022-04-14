import express from 'express';
const router = express.Router();

import {
  getUser,
  getUsers,
} from '../controllers/user.js';

router
  .route('/')
  .get(getUser)
router
  .route('/list')
  .get(getUsers)

export default router;
