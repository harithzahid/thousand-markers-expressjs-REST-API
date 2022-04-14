import express from 'express';
const router = express.Router();

import {
  getMarkers,
} from '../controllers/map.js';

router
  .route('/')
  .get(getMarkers)

export default router;
