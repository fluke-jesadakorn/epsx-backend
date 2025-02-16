import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Financial } from '../schemas/financial.schema';
import { LoggerUtil } from '../utils/logger.util';

@Injectable()
export class FinancialDataService {
  private static readonly DB_CONFIG = {
    maxAttempts: 3,
    initialDelay: 500,
    maxDelay: 5000,
    retryableErrors: ['MongoError', 'MongoNetworkError', 'MongoServerError', 'WriteConflict'],
  };

  constructor(
    @InjectModel(Financial.name)
    private readonly financialModel: Model<Financial>,
    private readonly logger: LoggerUtil
  ) {}

  private handleError(operation: string, error: Error): never {
    this.logger.error(`Failed to ${operation}: ${error.message}`, error.stack);
    throw error;
  }

  async getEPSGrowthData(limit: number, skip: number) {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'stocks',
          localField: 'stock',
          foreignField: '_id',
          as: 'stockData',
        },
      } as PipelineStage,
      { $unwind: '$stockData' } as PipelineStage,
      {
        $match: { eps_growth: { $exists: true, $ne: null } },
      } as PipelineStage,
      { $sort: { eps_growth: -1 } } as PipelineStage,
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                symbol: '$stockData.symbol',
                company_name: '$stockData.company_name',
                market_code: '$stockData.market_code',
                exchange_name: '$stockData.exchange_name',
                eps: '$eps_basic',
                eps_growth: '$eps_growth',
                last_report_date: '$report_date',
                rank: { $add: [skip, { $indexOfArray: ['$data', '$$ROOT'] }, 1] },
              },
            },
          ],
        },
      } as PipelineStage,
    ];

    const [result] = await this.financialModel.aggregate(pipeline);
    return {
      data: result.data,
      metadata: { total: result.metadata[0]?.total || 0 },
    };
  }

  async getStocksBatch(page: number, pageSize: number) {
    try {
      return await this.financialModel
        .find()
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();
    } catch (error) {
      this.handleError('fetch stocks batch', error);
    }
  }

  async saveFinancialData(financialData: Partial<Financial>) {
    try {
      return await new this.financialModel(financialData).save();
    } catch (error) {
      this.handleError('save financial data', error);
    }
  }

  async findExistingFinancial(stockId: string, fiscalYear: number, fiscalQuarter: number) {
    return this.financialModel.findOne({
      stock: stockId,
      fiscal_year: fiscalYear,
      fiscal_quarter: fiscalQuarter,
    });
  }

  async updateFinancialData(id: string, updateData: Partial<Financial>) {
    try {
      return await this.financialModel.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      this.handleError('update financial data', error);
    }
  }
}
