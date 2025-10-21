import express from 'express';
import {
  getAllSpecies,
  getSpeciesById,
  createSpecies,
  updateSpecies,
  deleteSpecies
} from '../controllers/speciesController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getAllSpecies);
router.get('/:id', authenticate, getSpeciesById);
router.post('/', authenticate, requireAdmin, createSpecies);
router.put('/:id', authenticate, requireAdmin, updateSpecies);
router.delete('/:id', authenticate, requireAdmin, deleteSpecies);

export default router;
