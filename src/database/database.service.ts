import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange } from '../entities/exchange.entity';
import { Stock } from '../entities/stock.entity';
import { Financial } from '../entities/financial.entity';
import { Event } from '../entities/event.entity';
import { LoggerService } from '../common/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type UserRole = 'free' | 'premium' | 'enterprise';

interface RequestLog {
  user_id: string;
  request_type: string;
}

@Injectable()
export class DatabaseService {
  private supabase: SupabaseClient;

  constructor(
    @InjectRepository(Exchange)
    private readonly exchangeRepository: Repository<Exchange>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(Financial)
    private readonly financialRepository: Repository<Financial>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be defined');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private async checkUserPermissions(
    userId: string,
    requestType: string,
  ): Promise<void> {
    try {
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { data: requests, error: logError } = await this.supabase
        .from('request_logs')
        .insert<RequestLog>({
          user_id: userId,
          request_type: requestType,
        })
        .select();

      if (logError) throw logError;

      const maxRequests =
        user.role === 'enterprise'
          ? 10000
          : user.role === 'premium'
            ? 5000
            : 1000;

      const { count } = await this.supabase
        .from('request_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('request_type', requestType)
        .gte('created_at', new Date(Date.now() - 60 * 1000).toISOString());

      if ((count ?? 0) >= maxRequests) {
        throw new Error('Rate limit exceeded');
      }
    } catch (error) {
      this.logger.error('Failed to check user permissions', error);
      throw new UnauthorizedException('Unable to verify access permissions');
    }
  }

  private async getUserRole(userId: string): Promise<UserRole> {
    const { data, error } = await this.supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      this.logger.error('Failed to get user role', error);
      throw new UnauthorizedException('Unable to verify user role');
    }

    return data.role;
  }

  async getExchanges(userId: string): Promise<Exchange[]> {
    try {
      await this.checkUserPermissions(userId, 'exchange_read');
      return await this.exchangeRepository.find();
    } catch (error) {
      this.logger.error('Failed to get exchanges', error);
      throw error;
    }
  }

  async upsertExchange(
    exchange: Partial<Exchange> | Partial<Exchange>[],
  ): Promise<void> {
    try {
      const exchanges = Array.isArray(exchange) ? exchange : [exchange];
      await this.exchangeRepository.upsert(exchanges, ['market_code']);
    } catch (error) {
      this.logger.error('Failed to upsert exchange', error);
      throw error;
    }
  }

  async getStockBySymbol(
    symbol: string,
    userId: string,
  ): Promise<Stock | null> {
    try {
      await this.checkUserPermissions(userId, 'stock_read');
      return await this.stockRepository.findOne({
        where: { symbol },
        relations: ['exchange'],
      });
    } catch (error) {
      this.logger.error(`Failed to get stock by symbol ${symbol}`, error);
      throw error;
    }
  }

  async getAllStocks(page = 1, limit = 100, userId: string): Promise<Stock[]> {
    try {
      await this.checkUserPermissions(userId, 'stock_read');
      return await this.stockRepository.find({
        skip: (page - 1) * limit,
        take: limit,
        relations: ['exchange'],
      });
    } catch (error) {
      this.logger.error('Failed to get stocks', error);
      throw error;
    }
  }

  async upsertStock(stock: Partial<Stock> | Partial<Stock>[]): Promise<void> {
    try {
      const stocks = Array.isArray(stock) ? stock : [stock];
      await this.stockRepository.upsert(stocks, ['symbol', 'exchange']);
    } catch (error) {
      this.logger.error('Failed to upsert stock', error);
      throw error;
    }
  }

  async getFinancialsByStockAndDate(
    stockId: string,
    reportDate: Date,
    userId: string,
  ): Promise<Financial | null> {
    try {
      await this.checkUserPermissions(userId, 'financial_read');
      const userRole = await this.getUserRole(userId);

      // Apply data access restrictions based on user role
      const now = new Date();
      if (userRole !== 'enterprise') {
        const dateLimit =
          userRole === 'premium'
            ? new Date(now.setFullYear(now.getFullYear() - 1))
            : new Date(now.setMonth(now.getMonth() - 3));

        if (reportDate < dateLimit) {
          throw new UnauthorizedException(
            'Data access restricted based on user role',
          );
        }
      }

      return await this.financialRepository.findOne({
        where: {
          stock: { id: stockId },
          report_date: reportDate,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to get financials for stock ${stockId} and date ${reportDate}`,
        error,
      );
      throw error;
    }
  }

  async upsertFinancials(
    financial: Partial<Financial> | Partial<Financial>[],
  ): Promise<void> {
    try {
      const financials = Array.isArray(financial) ? financial : [financial];
      await this.financialRepository.upsert(financials, [
        'stock_id',
        'report_date',
        'fiscal_quarter',
        'fiscal_year',
      ]);
    } catch (error) {
      this.logger.error('Failed to upsert financials', error);
      throw error;
    }
  }

  async getFinancialsByStockId(
    stockId: string,
    userId: string,
  ): Promise<Financial[]> {
    try {
      await this.checkUserPermissions(userId, 'financial_read');
      const userRole = await this.getUserRole(userId);

      const query = this.financialRepository
        .createQueryBuilder('financial')
        .where('financial.stock_id = :stockId', { stockId })
        .orderBy('financial.report_date', 'DESC');

      // Apply data access restrictions based on user role
      const now = new Date();
      if (userRole !== 'enterprise') {
        const dateLimit =
          userRole === 'premium'
            ? new Date(now.setFullYear(now.getFullYear() - 1))
            : new Date(now.setMonth(now.getMonth() - 3));

        query.andWhere('financial.report_date >= :dateLimit', { dateLimit });
      }

      return await query.getMany();
    } catch (error) {
      this.logger.error(`Failed to get financials for stock ${stockId}`, error);
      throw error;
    }
  }

  async getEPSGrowthRankings(
    limit: number = 20,
    skip: number = 0,
    userId: string,
  ): Promise<{ data: any[]; total: number }> {
    try {
      // await this.checkUserPermissions(userId, 'financial_read');
      // const userRole = await this.getUserRole(userId);

      // Build date restriction based on user role
      // const dateCondition = userRole === 'enterprise' 
      //   ? '' 
      //   : userRole === 'premium'
      //     ? `AND f.report_date >= NOW() - INTERVAL '1 year'`
      //     : `AND f.report_date >= NOW() - INTERVAL '3 months'`;

      const rawQuery = `
        WITH latest_eps AS (
          SELECT 
            f.stock_id,
            f.eps_diluted as eps,
            f.report_date,
            s.symbol,
            s.company_name,
            ROW_NUMBER() OVER (PARTITION BY f.stock_id ORDER BY f.report_date DESC) as rn
          FROM financials f
          INNER JOIN stocks s ON s.id = f.stock_id
          WHERE f.eps_diluted IS NOT NULL
        ),
        prev_eps AS (
          SELECT 
            l.stock_id,
            l.symbol,
            l.company_name,
            l.eps as current_eps,
            l.report_date as current_report_date,
            p.eps_diluted as previous_eps,
            p.report_date as previous_report_date,
            CASE 
              WHEN p.eps_diluted != 0 THEN ROUND(((l.eps - p.eps_diluted) / ABS(p.eps_diluted)) * 100, 1)
              ELSE NULL 
            END as growth_percent
          FROM latest_eps l
          LEFT JOIN financials p ON p.stock_id = l.stock_id
          AND p.report_date = (
            SELECT report_date
            FROM financials f2
            WHERE f2.stock_id = l.stock_id
            AND f2.eps_diluted IS NOT NULL
            ORDER BY report_date DESC
            OFFSET 1
            LIMIT 1
          )
          WHERE l.rn = 1
        ),
        ranked_data AS (
          SELECT *
          FROM prev_eps
          WHERE growth_percent IS NOT NULL
          ORDER BY growth_percent DESC
          LIMIT $1
          OFFSET $2
        )
        SELECT 
          COALESCE(
            json_agg(
              json_build_object(
                'current', json_build_object(
                  'symbol', symbol,
                  'companyName', company_name,
                  'eps', current_eps,
                  'epsGrowthPercent', growth_percent,
                  'reportDate', current_report_date
                ),
                'previous', json_build_object(
                  'symbol', symbol,
                  'companyName', company_name,
                  'eps', previous_eps,
                  'epsGrowthPercent', 0,
                  'reportDate', previous_report_date
                )
              )
            ),
            '[]'::json
          ) as data,
          (SELECT COUNT(*) FROM prev_eps WHERE growth_percent IS NOT NULL) as total
        FROM ranked_data;
      `;

      const result = await this.financialRepository.query(rawQuery, [
        limit,
        skip,
      ]);

      return {
        data: result[0].data,
        total: parseInt(result[0].total) || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get financials with stocks', error);
      throw error;
    }
  }

  async getFinancialsCount(userId: string): Promise<number> {
    try {
      await this.checkUserPermissions(userId, 'financial_read');
      const userRole = await this.getUserRole(userId);

      const query = this.financialRepository
        .createQueryBuilder('financial')
        .where('financial.eps_diluted IS NOT NULL');

      // Apply data access restrictions based on user role
      const now = new Date();
      if (userRole !== 'enterprise') {
        const dateLimit =
          userRole === 'premium'
            ? new Date(now.setFullYear(now.getFullYear() - 1))
            : new Date(now.setMonth(now.getMonth() - 3));

        query.andWhere('financial.report_date >= :dateLimit', { dateLimit });
      }

      return await query.cache(60000).getCount();
    } catch (error) {
      this.logger.error('Failed to get financials count', error);
      throw error;
    }
  }

  async financialExists(
    stockId: string,
    reportDate: Date,
    userId: string,
  ): Promise<boolean> {
    try {
      const financial = await this.getFinancialsByStockAndDate(
        stockId,
        reportDate,
        userId,
      );
      return financial !== null;
    } catch (error) {
      this.logger.error(
        `Failed to check financial existence for stock ${stockId} and date ${reportDate}`,
        error,
      );
      throw error;
    }
  }
}
