import { Species, Genus, Family, Order, Class, Division } from '../models/index.js';
import { Op, col } from 'sequelize';

export const getAllSpecies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      edibility,
      occurrence,
      genusId,
      familyId,
      orderId,
      classId,
      divisionId,
      season
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};
    const include = [
      {
        model: Genus,
        as: 'genus',
        include: [
          {
            model: Family,
            as: 'family',
            include: [
              {
                model: Order,
                as: 'order',
                include: [
                  {
                    model: Class,
                    as: 'class',
                    include: [{ model: Division, as: 'division' }]
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    // Apply filters
    if (search) {
      where[Op.or] = [
        { scientificName: { [Op.iLike]: `%${search}%` } },
        { commonName: { [Op.iLike]: `%${search}%` } },
        { commonNameDE: { [Op.iLike]: `%${search}%` } },
        { commonNameFR: { [Op.iLike]: `%${search}%` } },
        { commonNameIT: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (edibility) where.edibility = edibility;
    if (occurrence) where.occurrence = occurrence;
    if (genusId) where.genusId = genusId;

    if (season) {
      const month = parseInt(season);
      where[Op.or] = [
        { seasonStart: { [Op.lte]: month }, seasonEnd: { [Op.gte]: month } },
        { seasonStart: { [Op.gt]: col('seasonEnd') } } // Wraps around year
      ];
    }

    // Filter by higher taxonomy levels
    if (familyId || orderId || classId || divisionId) {
      include[0].where = {};
      if (familyId) include[0].where.familyId = familyId;

      if (orderId || classId || divisionId) {
        include[0].include[0].where = {};
        if (orderId) include[0].include[0].where.orderId = orderId;

        if (classId || divisionId) {
          include[0].include[0].include[0].where = {};
          if (classId) include[0].include[0].include[0].where.classId = classId;

          if (divisionId) {
            include[0].include[0].include[0].include[0].where = {};
            include[0].include[0].include[0].include[0].where.divisionId = divisionId;
          }
        }
      }
    }

    const { count, rows: species } = await Species.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [['scientificName', 'ASC']],
      distinct: true
    });

    res.json({
      species,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get species error:', error);
    res.status(500).json({ error: 'Failed to fetch species' });
  }
};

export const getSpeciesById = async (req, res) => {
  try {
    const species = await Species.findByPk(req.params.id, {
      include: [
        {
          model: Genus,
          as: 'genus',
          include: [
            {
              model: Family,
              as: 'family',
              include: [
                {
                  model: Order,
                  as: 'order',
                  include: [
                    {
                      model: Class,
                      as: 'class',
                      include: [{ model: Division, as: 'division' }]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    if (!species) {
      return res.status(404).json({ error: 'Species not found' });
    }

    res.json(species);
  } catch (error) {
    console.error('Get species by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch species' });
  }
};

export const createSpecies = async (req, res) => {
  try {
    const species = await Species.create(req.body);
    const fullSpecies = await Species.findByPk(species.id, {
      include: [{ model: Genus, as: 'genus' }]
    });
    res.status(201).json(fullSpecies);
  } catch (error) {
    console.error('Create species error:', error);
    res.status(500).json({ error: 'Failed to create species' });
  }
};

export const updateSpecies = async (req, res) => {
  try {
    const species = await Species.findByPk(req.params.id);

    if (!species) {
      return res.status(404).json({ error: 'Species not found' });
    }

    await species.update(req.body);
    const updatedSpecies = await Species.findByPk(species.id, {
      include: [{ model: Genus, as: 'genus' }]
    });

    res.json(updatedSpecies);
  } catch (error) {
    console.error('Update species error:', error);
    res.status(500).json({ error: 'Failed to update species' });
  }
};

export const deleteSpecies = async (req, res) => {
  try {
    const species = await Species.findByPk(req.params.id);

    if (!species) {
      return res.status(404).json({ error: 'Species not found' });
    }

    await species.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Delete species error:', error);
    res.status(500).json({ error: 'Failed to delete species' });
  }
};
