import { PipelineStage } from 'mongoose';

/**
 * Pipeline to get EPS growth data
 */
export const getEPSGrowthPipeline = (
  skip: number,
  limit: number,
): PipelineStage[] => [
  // Join with stocks collection
  {
    $lookup: {
      from: 'stocks',
      localField: 'stock',
      foreignField: '_id',
      as: 'stock_info',
    },
  },
  // Unwind the stock array (will be single document)
  { $unwind: '$stock_info' },
  // Match only records with EPS data
  {
    $match: {
      eps_basic: { $ne: null },
    },
  },
  // Sort by fiscal year and quarter
  {
    $sort: {
      fiscal_year: -1,
      fiscal_quarter: -1,
    },
  },
  // Group by stock to get latest and previous EPS
  {
    $group: {
      _id: '$stock',
      latest_eps: { $first: '$eps_basic' },
      eps_values: { $push: '$eps_basic' }, // Collect all EPS values
      symbol: { $first: '$stock_info.symbol' },
      company_name: { $first: '$stock_info.company_name' },
      market_code: { $first: '$stock_info.exchange.market_code' },
      exchange_name: { $first: '$stock_info.exchange.name' },
      last_report_date: { $first: '$report_date' },
    },
  },
  // Get previous EPS from collected values
  {
    $addFields: {
      previous_eps: { $arrayElemAt: ['$eps_values', 4] }, // Get same quarter last year
    },
  },
  // Calculate EPS growth
  {
    $addFields: {
      eps_growth: {
        $cond: [
          { $and: [
            { $ne: ['$previous_eps', null] },
            { $ne: ['$previous_eps', 0] }
          ]},
          {
            $multiply: [
              {
                $divide: [
                  { $subtract: ['$latest_eps', '$previous_eps'] },
                  { $abs: '$previous_eps' },
                ],
              },
              100,
            ],
          },
          null,
        ],
      },
    },
  },
  // Filter out null growth rates
  {
    $match: {
      eps_growth: { $ne: null },
    },
  },
  // Sort by growth rate
  {
    $sort: { eps_growth: -1 },
  },
  // Add ranking
  {
    $setWindowFields: {
      sortBy: { eps_growth: -1 },
      output: {
        rank: {
          $rank: {},
        },
      },
    },
  },
  // Project final fields
  {
    $project: {
      _id: 0,
      symbol: 1,
      company_name: 1,
      market_code: 1,
      exchange_name: 1,
      eps: '$latest_eps',
      eps_growth: { $round: ['$eps_growth', 2] },
      rank: 1,
      last_report_date: 1,
    },
  },
  // Apply pagination
  { $skip: skip },
  { $limit: limit },
];

/**
 * Pipeline to get total count for EPS growth data
 */
export const getEPSGrowthCountPipeline = (): PipelineStage[] => [
  // Join with stocks collection
  {
    $lookup: {
      from: 'stocks',
      localField: 'stock',
      foreignField: '_id',
      as: 'stock_info',
    },
  },
  // Unwind the stock array
  { $unwind: '$stock_info' },
  // Match only records with EPS data
  {
    $match: {
      eps_basic: { $ne: null },
    },
  },
  // Group by stock to get latest and previous EPS
  {
    $group: {
      _id: '$stock',
      latest_eps: { $first: '$eps_basic' },
      eps_values: { $push: '$eps_basic' },
    },
  },
  // Get previous EPS from collected values
  {
    $addFields: {
      previous_eps: { $arrayElemAt: ['$eps_values', 4] },
    },
  },
  // Calculate growth and filter nulls in a single stage
  {
    $match: {
      $expr: {
        $and: [
          { $ne: ['$previous_eps', null] },
          { $ne: ['$previous_eps', 0] },
        ],
      },
    },
  },
  // Get total count
  {
    $count: 'total',
  },
];
