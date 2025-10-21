import express from 'express';
import { Division, Class, Order, Family, Genus } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Generic CRUD handlers for taxonomy
const createTaxonomyRoutes = (model, modelName, parentKey) => {
  const routes = express.Router();

  routes.get('/', authenticate, async (req, res) => {
    try {
      const items = await model.findAll({
        order: [['name', 'ASC']]
      });
      res.json(items);
    } catch (error) {
      console.error(`Get ${modelName} error:`, error);
      res.status(500).json({ error: `Failed to fetch ${modelName}` });
    }
  });

  routes.get('/:id', authenticate, async (req, res) => {
    try {
      const item = await model.findByPk(req.params.id);
      if (!item) {
        return res.status(404).json({ error: `${modelName} not found` });
      }
      res.json(item);
    } catch (error) {
      console.error(`Get ${modelName} by ID error:`, error);
      res.status(500).json({ error: `Failed to fetch ${modelName}` });
    }
  });

  routes.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
      const item = await model.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error(`Create ${modelName} error:`, error);
      res.status(500).json({ error: `Failed to create ${modelName}` });
    }
  });

  routes.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const item = await model.findByPk(req.params.id);
      if (!item) {
        return res.status(404).json({ error: `${modelName} not found` });
      }
      await item.update(req.body);
      res.json(item);
    } catch (error) {
      console.error(`Update ${modelName} error:`, error);
      res.status(500).json({ error: `Failed to update ${modelName}` });
    }
  });

  routes.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const item = await model.findByPk(req.params.id);
      if (!item) {
        return res.status(404).json({ error: `${modelName} not found` });
      }
      await item.destroy();
      res.status(204).send();
    } catch (error) {
      console.error(`Delete ${modelName} error:`, error);
      res.status(500).json({ error: `Failed to delete ${modelName}` });
    }
  });

  return routes;
};

router.use('/divisions', createTaxonomyRoutes(Division, 'division'));
router.use('/classes', createTaxonomyRoutes(Class, 'class', 'divisionId'));
router.use('/orders', createTaxonomyRoutes(Order, 'order', 'classId'));
router.use('/families', createTaxonomyRoutes(Family, 'family', 'orderId'));
router.use('/genera', createTaxonomyRoutes(Genus, 'genus', 'familyId'));

export default router;
