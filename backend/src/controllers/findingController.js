import { Finding, Species, User, Genus, Family, Order, Class, Division } from '../models/index.js';
import { Op } from 'sequelize';
import { FULL_TAXONOMY_INCLUDE, paginateQuery } from '../utils/sequelizeHelpers.js';
import { requireOwnershipOrAdmin, scopeToUser } from '../utils/authorization.js';

export const getAllFindings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      speciesId,
      startDate,
      endDate,
      myFindings
    } = req.query;

    let where = {};

    // Users can only see their own findings unless they're admin
    const forceUserScope = myFindings === 'true';
    where = scopeToUser(where, req.user, forceUserScope);

    if (speciesId) where.speciesId = speciesId;

    if (startDate || endDate) {
      where.foundAt = {};
      if (startDate) where.foundAt[Op.gte] = new Date(startDate);
      if (endDate) where.foundAt[Op.lte] = new Date(endDate);
    }

    const result = await paginateQuery(Finding, {
      where,
      include: [
        {
          model: Species,
          as: 'species',
          include: [{ model: Genus, as: 'genus' }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ],
      page,
      limit,
      order: [['foundAt', 'DESC']]
    });

    res.json({
      findings: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get findings error:', error);
    res.status(500).json({ error: 'Failed to fetch findings' });
  }
};

export const getFindingById = async (req, res) => {
  try {
    const finding = await Finding.findByPk(req.params.id, {
      include: [
        {
          model: Species,
          as: 'species',
          include: [FULL_TAXONOMY_INCLUDE]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ]
    });

    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    // Users can only see their own findings unless they're admin
    requireOwnershipOrAdmin(finding, req.user, 'Access denied');

    res.json(finding);
  } catch (error) {
    console.error('Get finding by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch finding' });
  }
};

export const createFinding = async (req, res) => {
  try {
    const finding = await Finding.create({
      ...req.body,
      userId: req.user.id
    });

    const fullFinding = await Finding.findByPk(finding.id, {
      include: [
        {
          model: Species,
          as: 'species',
          include: [{ model: Genus, as: 'genus' }]
        }
      ]
    });

    res.status(201).json(fullFinding);
  } catch (error) {
    console.error('Create finding error:', error);
    res.status(500).json({ error: 'Failed to create finding' });
  }
};

export const updateFinding = async (req, res) => {
  try {
    const finding = await Finding.findByPk(req.params.id);

    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    // Users can only update their own findings
    requireOwnershipOrAdmin(finding, req.user, 'Access denied');

    await finding.update(req.body);
    const updatedFinding = await Finding.findByPk(finding.id, {
      include: [
        {
          model: Species,
          as: 'species',
          include: [{ model: Genus, as: 'genus' }]
        }
      ]
    });

    res.json(updatedFinding);
  } catch (error) {
    console.error('Update finding error:', error);
    res.status(500).json({ error: 'Failed to update finding' });
  }
};

export const deleteFinding = async (req, res) => {
  try {
    const finding = await Finding.findByPk(req.params.id);

    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    // Users can only delete their own findings
    requireOwnershipOrAdmin(finding, req.user, 'Access denied');

    await finding.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Delete finding error:', error);
    res.status(500).json({ error: 'Failed to delete finding' });
  }
};

export const getFindingsMap = async (req, res) => {
  try {
    // Users can only see their own findings unless they're admin
    const where = scopeToUser({}, req.user);

    const findings = await Finding.findAll({
      where,
      attributes: ['id', 'latitude', 'longitude', 'foundAt', 'location'],
      include: [
        {
          model: Species,
          as: 'species',
          attributes: ['id', 'scientificName', 'commonName', 'edibility']
        }
      ]
    });

    res.json(findings);
  } catch (error) {
    console.error('Get findings map error:', error);
    res.status(500).json({ error: 'Failed to fetch findings map' });
  }
};
