import express from 'express';
import {
  getAllFindings,
  getFindingById,
  createFinding,
  updateFinding,
  deleteFinding,
  getFindingsMap
} from '../controllers/findingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getAllFindings);
router.get('/map', authenticate, getFindingsMap);
router.get('/:id', authenticate, getFindingById);
router.post('/', authenticate, createFinding);
router.put('/:id', authenticate, updateFinding);
router.delete('/:id', authenticate, deleteFinding);

export default router;
