import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { chromium } from 'playwright';
import { Exchange } from '../../database/schemas/exchange.schema';
import { logger } from '../../utils/logger';
import { PaginationParams } from '../../types';
import { getPaginationOptions } from '../../utils/pagination.util';
import { Paginate } from '../../utils/decorators/paginate.decorator';

// TODO: Future Feature - Add caching layer to reduce database load
// TODO: Future Feature - Add rate limiting for scraping to avoid being blocked

@Injectable()
export class ExchangeService {
  constructor(
    @InjectModel(Exchange.name)
    private readonly exchangeModel: Model<Exchange>,
  ) {}

  /**
   * Get all exchanges with pagination
   */
  @Paginate()
  async getAllExchanges(params: PaginationParams = {}) {
    const { skip, take } = getPaginationOptions(params);
    const [data, total] = await Promise.all([
      this.exchangeModel.find().skip(skip).limit(take).exec(),
      this.exchangeModel.countDocuments().exec(),
    ]);
    return { data, total };
  }

  async scrapeAndSaveExchanges() {
    const browser = await chromium.launch({
      headless: process.env.HEADLESS_MODE !== 'false',
      slowMo:
        process.env.DEBUG_MODE === 'true'
          ? Number(process.env.DEBUG_SLOW_MO) || 100
          : 0,
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('https://stockanalysis.com/list/exchanges/', {
        waitUntil: 'networkidle',
      });

      const table = await page.waitForSelector('#main > div > div > table');
      if (!table) {
        throw new Error('Table not found');
      }

      const exchanges = await page.$$eval(
        '#main > div > div > table tbody tr',
        (rows) =>
          rows.map((row) => ({
            exchange_name: row.querySelectorAll('td')[0].innerText.trim(),
            country: row.querySelectorAll('td')[1].innerText.trim(),
            market_code: row.querySelectorAll('td')[2].innerText.trim(),
            currency: row.querySelectorAll('td')[3].innerText.trim(),
            exchange_url:
              row.querySelectorAll('td')[0].querySelector('a')?.href.trim() ||
              '',
            timezone: 'UTC', // Default timezone, should be configured properly
          })),
      );

      if (exchanges.length === 0) {
        throw new Error('No exchanges found');
      }

      logger.info(`Found ${exchanges.length} exchanges`);

      let newCount = 0;
      let updateCount = 0;

      for (const exchangeData of exchanges) {
        try {
          const existingExchange = await this.exchangeModel
            .findOne({ market_code: exchangeData.market_code })
            .exec();

          if (existingExchange) {
            // Update existing exchange
            await this.exchangeModel
              .updateOne(
                { market_code: exchangeData.market_code },
                exchangeData,
              )
              .exec();
            updateCount++;
            logger.info(`Updated exchange: ${exchangeData.market_code}`);
          } else {
            // Create new exchange
            await this.exchangeModel.create(exchangeData);
            newCount++;
            logger.info(`Added new exchange: ${exchangeData.market_code}`);
          }
        } catch (error) {
          logger.error(
            `Failed to save exchange ${exchangeData.market_code}:`,
            error,
          );
        }
      }

      logger.info(
        `Operation completed. Added ${newCount} new exchanges, updated ${updateCount} existing exchanges.`,
      );

      const totalCount = await this.exchangeModel.countDocuments().exec();
      logger.info(`Total exchanges in database: ${totalCount}`);
    } catch (error) {
      logger.error('Failed to scrape exchanges:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }
}
