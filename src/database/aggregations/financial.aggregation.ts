import { PipelineStage } from 'mongoose';

/**
 * Global aggregation pipelines for financial data
 * These pipelines are designed to be reusable across different services
 *
 * TODO: Future AI/LangChain Integration Plans:
 * 1. Add semantic understanding of aggregation stages for AI-driven pipeline generation
 * 2. Implement dynamic pipeline modification based on LangChain context
 * 3. Add natural language to aggregation pipeline conversion
 * 4. Enable AI-assisted optimization of pipeline stages
 * 5. Add support for contextual query generation based on user intent
 * 6. Implement AI-driven data relationship discovery
 * 7. Add dynamic field selection based on semantic relevance
 * 8. Enable automated pipeline optimization based on query patterns
 */

/**
 * Base pipeline for joining financial data with stock and exchange information
 */
export const baseFinancialLookupPipeline: PipelineStage[] = [
  {
    $lookup: {
      from: 'stocks',
      localField: 'stock',
      foreignField: '_id',
      as: 'stock_info',
    },
  },
  {
    $unwind: '$stock_info',
  },
  {
    $lookup: {
      from: 'exchanges',
      localField: 'stock_info.exchange',
      foreignField: '_id',
      as: 'exchange_info',
    },
  },
  {
    $unwind: '$exchange_info',
  },
];

/**
 * Pipeline stages for calculating EPS growth
 */
export const epsGrowthPipelineStages: PipelineStage[] = [
  ...baseFinancialLookupPipeline,
  {
    $setWindowFields: {
      partitionBy: '$stock',
      sortBy: { fiscal_year: 1, fiscal_quarter: 1 },
      output: {
        prev_eps: {
          $shift: { output: '$eps_basic', by: -1, default: null },
        },
      },
    },
  },
  {
    $addFields: {
      eps_basic_growth: {
        $cond: [
          {
            $and: [{ $ne: ['$prev_eps', null] }, { $ne: ['$prev_eps', 0] }],
          },
          {
            $multiply: [
              {
                $divide: [
                  { $subtract: ['$eps_basic', '$prev_eps'] },
                  '$prev_eps',
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
  { $match: { eps_basic_growth: { $ne: null } } },
];

/**
 * Complete pipeline for EPS growth ranking and projection
 *
 * Performance Optimization:
 * 1. Initial $project reduces memory usage before sorting by selecting only needed fields
 * 2. $sort is placed after $project to minimize memory usage during sort
 * 3. Uses { allowDiskUse: true } in query execution (set in service)
 * 4. Uses hint for optimal index usage
 * 5. Pipeline stages ordered for maximum efficiency
 *
 * Required Indexes:
 * db.financials.createIndex({ "eps_basic": 1 })
 * db.financials.createIndex({ "stock": 1, "fiscal_year": 1, "fiscal_quarter": 1 })
 * db.financials.createIndex({ "eps_basic_growth": -1 })
 */
export const getEPSGrowthPipeline = (
  skip: number,
  limit: number,
): PipelineStage[] => [
  ...epsGrowthPipelineStages,
  {
    $project: {
      _id: 1,
      stock_info: {
        symbol: 1,
        company_name: 1,
      },
      exchange_info: {
        market_code: 1,
        name: 1,
      },
      eps_basic: 1,
      eps_basic_growth: 1,
      report_date: 1,
    },
  },
  {
    $sort: {
      eps_basic_growth: -1,
    },
  },
  { $skip: skip },
  { $limit: limit },
  {
    $setWindowFields: {
      sortBy: { eps_basic_growth: -1 },
      output: {
        rank: { $rank: {} },
      },
    },
  },
  {
    $project: {
      _id: '$_id',
      symbol: '$stock_info.symbol',
      company_name: '$stock_info.company_name',
      market_code: '$exchange_info.market_code',
      exchange_name: '$exchange_info.name',
      eps: '$eps_basic',
      eps_growth: '$eps_basic_growth',
      last_report_date: '$report_date',
      rank: 1,
      growth_percentage: {
        $concat: [{ $toString: { $round: ['$eps_basic_growth', 2] } }, '%'],
      },
    },
  },
];

/**
 * Pipeline for counting total EPS growth records
 */
export const getEPSGrowthCountPipeline = (): PipelineStage[] => [
  ...epsGrowthPipelineStages,
  { $count: 'total' },
];
