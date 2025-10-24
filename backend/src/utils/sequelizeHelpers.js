import { Division, Class, Order, Family, Genus } from '../models/index.js';

/**
 * Reusable Sequelize include configurations
 * Eliminates duplicate nested taxonomy includes across controllers
 */

/**
 * Full taxonomy tree include (all levels)
 * Use for detail pages where complete taxonomy is needed
 */
export const FULL_TAXONOMY_INCLUDE = {
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
              include: [
                {
                  model: Division,
                  as: 'division'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Basic taxonomy include (genus and family only)
 * Use for list pages where minimal taxonomy is needed
 */
export const BASIC_TAXONOMY_INCLUDE = {
  model: Genus,
  as: 'genus',
  attributes: ['id', 'name'],
  include: [
    {
      model: Family,
      as: 'family',
      attributes: ['id', 'name']
    }
  ]
};

/**
 * Genus-only include (lightest weight)
 * Use when only genus name is needed
 */
export const GENUS_ONLY_INCLUDE = {
  model: Genus,
  as: 'genus',
  attributes: ['id', 'name']
};

/**
 * Pagination helper function
 * Eliminates duplicate pagination logic across controllers
 *
 * @param {Model} model - Sequelize model
 * @param {Object} options - Query options
 * @param {Object} options.where - Where clause
 * @param {Array} options.include - Include array
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 50, max: 100)
 * @param {Array} options.order - Order clause (default: [['createdAt', 'DESC']])
 * @param {Object} options.attributes - Attributes to select
 * @returns {Promise<Object>} Result with data and pagination info
 */
export async function paginateQuery(model, options = {}) {
  const {
    where = {},
    include = [],
    page = 1,
    limit = 50,
    order = [['createdAt', 'DESC']],
    attributes,
  } = options;

  // Ensure page and limit are valid numbers
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 50));

  const offset = (validPage - 1) * validLimit;

  const queryOptions = {
    where,
    include,
    limit: validLimit,
    offset,
    order,
    distinct: true, // Important for correct count with includes
  };

  if (attributes) {
    queryOptions.attributes = attributes;
  }

  const { count, rows } = await model.findAndCountAll(queryOptions);

  return {
    data: rows,
    pagination: {
      total: count,
      page: validPage,
      limit: validLimit,
      totalPages: Math.ceil(count / validLimit),
      hasNext: validPage < Math.ceil(count / validLimit),
      hasPrev: validPage > 1,
    }
  };
}
