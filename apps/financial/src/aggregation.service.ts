import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, SortOrder } from 'mongoose';
import { EpsGrowth, EpsGrowthDocument, Financial } from '@app/common/schemas';

interface GetEPSGrowthRankingParams {
  limit: number;
  skip: number;
  market_code?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Interfaces for aggregation responses
export interface EpsGrowthData {
  symbol: string;
  company_name: string;
  market_code: string;
  eps_diluted: number;
  previous_eps_diluted: number;
  eps_growth: number;
  report_date: string;
  year: number;
  quarter: number;
}

export interface ThreeQuarterEPSGrowth {
  symbol: string;
  company_name: string;
  market_code: string;
  quarters: Array<{
    quarter: number;
    year: number;
    eps: number;
    eps_growth: number;
    report_date: string;
  }>;
  average_growth: number;
}

export interface EPSPriceGrowth {
  symbol: string;
  company_name: string;
  eps_growth: number;
  price_growth: number;
  correlation: number;
  period_start: string;
  period_end: string;
}

export interface EPSVolumeGrowth {
  symbol: string;
  company_name: string;
  eps_growth: number;
  volume_growth: number;
  correlation: number;
  period_start: string;
  period_end: string;
}

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(
    @InjectModel(Financial.name)
    private financialModel: Model<Financial>,
    @InjectModel('EpsGrowth')
    private epsGrowthModel: Model<EpsGrowth>,
  ) {}

  /**
   * Get EPS Growth Ranking for stocks
   */
  /**
   * Get EPS Growth for a single symbol
   */
  async getEPSGrowthForSymbol(symbol: string): Promise<EpsGrowthData | null> {
    this.logger.log(`Calculating EPS growth for symbol: ${symbol}`);
    try {
      // First ensure we have valid symbol
      if (!symbol) {
        this.logger.warn(
          'Attempting to calculate EPS growth with undefined symbol',
        );
        return null;
      }

      let pipeline: PipelineStage[] = [
        // First get the stock document
        {
          $lookup: {
            from: 'stocks',
            let: { stockId: '$stock' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$stockId'] },
                      { $eq: ['$symbol', symbol] },
                    ],
                  },
                },
              },
            ],
            as: 'stock_info',
          },
        },
        // Filter out records where stock lookup failed
        {
          $match: {
            'stock_info.0': { $exists: true },
          },
        },
        {
          $unwind: '$stock_info',
        },
        // Get exchange info
        {
          $lookup: {
            from: 'exchanges',
            let: { exchangeId: '$stock_info.exchange' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$exchangeId'] },
                },
              },
            ],
            as: 'exchange_info',
          },
        },
        {
          $unwind: '$exchange_info',
        },
      ];

      // Add previous EPS field
      pipeline.push({
        $setWindowFields: {
          partitionBy: '$stock_info.symbol',
          sortBy: { fiscal_year: -1, fiscal_quarter: -1 },
          output: {
            previous_eps_diluted: {
              $shift: {
                output: '$eps_diluted',
                by: 1,
                default: null,
              },
            },
          },
        },
      });

      // Calculate EPS growth percentage with improved error handling
      pipeline.push({
        $addFields: {
          eps_growth: {
            $cond: {
              if: {
                $and: [
                  { $ne: ['$eps_diluted', null] },
                  { $ne: ['$previous_eps_diluted', null] },
                  { $ne: ['$previous_eps_diluted', 0] },
                ],
              },
              then: {
                $cond: {
                  if: { $gt: ['$previous_eps_diluted', 0] },
                  then: {
                    $multiply: [
                      {
                        $divide: [
                          {
                            $subtract: [
                              '$eps_diluted',
                              '$previous_eps_diluted',
                            ],
                          },
                          '$previous_eps_diluted',
                        ],
                      },
                      100,
                    ],
                  },
                  else: {
                    $cond: {
                      if: { $gt: ['$eps_diluted', '$previous_eps_diluted'] },
                      then: 100, // Improvement from negative to positive
                      else: -100, // Deterioration or stayed negative
                    },
                  },
                },
              },
              else: 0, // Default to 0 instead of null for missing/invalid data
            },
          },
        },
      });

      // Group by stock to get latest data
      pipeline.push({
        $sort: { fiscal_year: -1, fiscal_quarter: -1 },
      });

      pipeline.push({
        $limit: 1,
      });

      const result = await this.financialModel.aggregate(pipeline).exec();

      if (!result.length) {
        this.logger.warn(
          `No financial data found for symbol: ${symbol}. Pipeline returned no results.`,
        );
        return null;
      }

      const resultCount = result.length;
      this.logger.debug(
        `Found ${resultCount} financial records for symbol: ${symbol}`,
      );

      const data = result[0];
      this.logger.debug(`EPS calculation results for ${symbol}:`, {
        eps_diluted: data.eps_diluted,
        previous_eps_diluted: data.previous_eps_diluted,
        eps_growth: data.eps_growth,
        report_date: data.report_date,
        year: data.fiscal_year,
        quarter: data.fiscal_quarter,
      });
      return {
        symbol: data.stock_info.symbol,
        company_name: data.stock_info.company_name,
        market_code: data.exchange_info.market_code,
        eps_diluted: data.eps_diluted,
        previous_eps_diluted: data.previous_eps_diluted,
        eps_growth: data.eps_growth,
        report_date: data.report_date,
        year: data.fiscal_year,
        quarter: data.fiscal_quarter,
      };
    } catch (error) {
      this.logger.error(
        `Error calculating EPS growth for symbol ${symbol}:`,
        error.message,
      );
      this.logger.error(
        `Error calculating EPS growth for symbol ${symbol}:`,
        error,
      );
      return null;
    }
  }

  async getEPSGrowthRankingOnceQuarter(
    limit: number = 20,
    skip: number = 0,
  ): Promise<{
    data: EpsGrowthData[];
    metadata: {
      skip: number;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      let pipeline: PipelineStage[] = [
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

      // Add previous EPS field
      pipeline.push({
        $setWindowFields: {
          partitionBy: '$stock_info.symbol',
          sortBy: { fiscal_year: -1, fiscal_quarter: -1 },
          output: {
            previous_eps_diluted: {
              $shift: {
                output: '$eps_diluted',
                by: 1,
                default: null,
              },
            },
          },
        },
      });

      // Calculate EPS growth percentage
      pipeline.push({
        $addFields: {
          eps_growth: {
            $cond: {
              if: {
                $and: [
                  { $ne: ['$previous_eps_diluted', null] },
                  { $ne: ['$previous_eps_diluted', 0] },
                  { $gt: ['$previous_eps_diluted', 0] },
                ],
              },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$eps_diluted', '$previous_eps_diluted'] },
                      '$previous_eps_diluted',
                    ],
                  },
                  100,
                ],
              },
              else: null,
            },
          },
        },
      });

      // Group by stock
      pipeline.push({
        $group: {
          _id: '$stock',
          symbol: { $first: '$stock_info.symbol' },
          company_name: { $first: '$stock_info.company_name' },
          market_code: { $first: '$exchange_info.market_code' },
          eps_diluted: { $first: '$eps_diluted' },
          previous_eps_diluted: { $first: '$previous_eps_diluted' },
          eps_growth: { $first: '$eps_growth' },
          report_date: { $first: '$report_date' },
          year: { $first: '$fiscal_year' },
          quarter: { $first: '$fiscal_quarter' },
        },
      });

      // Sort by EPS growth percentage
      pipeline.push({
        $sort: { year: -1, quarter: -1, eps_growth: -1 },
      });

      // Calculate EPS growth
      pipeline.push({
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      });

      const result = await this.financialModel.aggregate(pipeline).exec();

      const data = result[0]?.data || [];
      const total = result[0]?.totalCount[0]?.count || 0;

      const page = Math.floor(skip / limit) + 1;
      const totalPages = Math.ceil(total / limit);

      const operations = await Promise.all(
        data.map(async (result) => {
          const saved = await this.epsGrowthModel.findOneAndUpdate(
            {
              symbol: result.symbol,
              report_date: result.report_date,
              year: result.year,
              quarter: result.quarter,
            },
            result,
            { upsert: true, new: true },
          );
          this.logger.debug(
            `Saved EPS growth data for symbol: ${result.symbol}`,
          );
          return saved;
        }),
      );

      return {
        data: operations,
        metadata: {
          skip,
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Error calculating EPS growth ranking', error);
      throw error;
    }
  }

  /**
   * Get EPS growth for last 3 quarters
   */
  async getThreeQuarterEPSGrowth(
    limit: number = 20,
    skip: number = 0,
  ): Promise<{
    data: ThreeQuarterEPSGrowth[];
    metadata: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    throw new Error('Method not implemented');
  }

  /**
   * Get correlation between EPS growth and price growth
   */
  async getEPSPriceGrowthCorrelation(
    timeframe: 'quarterly' | 'annual' = 'quarterly',
    limit: number = 20,
    skip: number = 0,
  ): Promise<{
    data: EPSPriceGrowth[];
    metadata: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    throw new Error('Method not implemented');
  }

  /**
   * Calculate and save EPS growth data for all financial records
   */
  async calculateAndSaveAllEPSGrowth() {
    this.logger.log('Starting batch EPS growth calculation and save process');

    try {
      // Build the pipeline to calculate EPS growth for all stocks
      const pipeline: PipelineStage[] = [
        // Join with stocks collection
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
        // Join with exchanges collection
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
        // Calculate previous EPS
        {
          $setWindowFields: {
            partitionBy: '$stock_info.symbol',
            sortBy: { fiscal_year: -1, fiscal_quarter: -1 },
            output: {
              previous_eps_diluted: {
                $shift: {
                  output: '$eps_diluted',
                  by: 1,
                  default: null,
                },
              },
            },
          },
        },
        // Calculate EPS growth
        {
          $addFields: {
            eps_growth: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ['$eps_diluted', null] },
                    { $ne: ['$previous_eps_diluted', null] },
                    { $ne: ['$previous_eps_diluted', 0] },
                  ],
                },
                then: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $subtract: ['$eps_diluted', '$previous_eps_diluted'],
                        },
                        '$previous_eps_diluted',
                      ],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },
        // Project the fields we want to save (explicitly exclude _id)
        {
          $project: {
            _id: 0,
            symbol: '$stock_info.symbol',
            company_name: '$stock_info.company_name',
            market_code: '$exchange_info.market_code',
            eps_diluted: 1,
            previous_eps_diluted: 1,
            eps_growth: 1,
            report_date: 1,
            year: '$fiscal_year',
            quarter: '$fiscal_quarter',
          },
        },
        // Sort by latest data
        {
          $sort: { symbol: 1, year: -1, quarter: -1 },
        },
        // Group by symbol to get latest record for each stock
        {
          $group: {
            _id: '$symbol',
            data: { $first: '$$ROOT' },
          },
        },
      ];

      // Execute the pipeline
      const results = await this.financialModel.aggregate(pipeline).exec();

      this.logger.log(`Found ${results.length} records to process`);

      // Batch save the results
      const batchSize = 1000;
      let processed = 0;
      let failed = 0;

      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);
        try {
          const operations = batch.map((result) => {
            // Ensure we don't include any _id fields in the update
            const { _id, data } = result;
            const { _id: dataId, ...updateData } = data;

            return {
              updateOne: {
                filter: {
                  symbol: updateData.symbol,
                  year: updateData.year,
                  quarter: updateData.quarter,
                },
                update: { $set: updateData },
                upsert: true,
              },
            };
          });

          const bulkResult = await this.epsGrowthModel.bulkWrite(operations);
          processed += bulkResult.modifiedCount + bulkResult.upsertedCount;
          this.logger.log(
            `Processed batch ${i / batchSize + 1}: ${bulkResult.modifiedCount + bulkResult.upsertedCount} records`,
          );
        } catch (error) {
          this.logger.error(
            `Error processing batch ${i / batchSize + 1}:`,
            error,
          );
          failed += batch.length;
        }
      }

      return {
        status: 'completed',
        summary: {
          processed,
          failed,
          total: processed + failed,
        },
      };
    } catch (error) {
      this.logger.error('Error in batch processing:', error);
      throw error;
    }
  }

  /**
   * Get EPS Growth Ranking from pre-calculated data
   */
  async getEPSGrowthRanking(params: GetEPSGrowthRankingParams) {
    try {
      // Build query
      const query: any = {};
      if (params.market_code) {
        query.market_code = params.market_code;
      }

      // Build sort object
      const sortOrder: SortOrder = params.sortOrder === 'asc' ? 1 : -1;
      const sort: { [key: string]: SortOrder } = {
        [params.sortBy]: sortOrder,
      };

      // Execute query with pagination
      const [data, total] = await Promise.all([
        this.epsGrowthModel
          .find(query)
          .sort(sort)
          .skip(params.skip)
          .limit(params.limit)
          .exec(),
        this.epsGrowthModel.countDocuments(query),
      ]);

      const page = Math.floor(params.skip / params.limit) + 1;
      const totalPages = Math.ceil(total / params.limit);

      return {
        data,
        metadata: {
          skip: params.skip,
          total,
          page,
          limit: params.limit,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching EPS growth ranking', error);
      throw error;
    }
  }

  /**
   * Aggregate data for AI-powered graph visualizations
   */
  async getGraphAggregation(params: {
    metrics: string[];
    timeframe: string;
    groupBy?: string;
  }): Promise<any> {
    throw new Error('Method not implemented');
  }
}
