import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Financial } from '@app/common/schemas';
import { StockWithMarketCode } from '../types/scheduler.types';
import { FinancialHttpService } from './financial-http.service';
import { FinancialDataService } from './financial-data.service';
import { FinancialDbService } from './financial-db.service';

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class FinancialSchedulerService {
  private readonly logger = new Logger(FinancialSchedulerService.name);

  constructor(
    @InjectModel(Financial.name)
    private readonly financialModel: Model<Financial>,
    private readonly httpService: FinancialHttpService,
    private readonly dataService: FinancialDataService,
    private readonly dbService: FinancialDbService,
  ) {}

  @Cron('0 0 * * *') // Run at midnight every day
  async handleFinancialDataScraping() {
    this.logger.log('Starting scheduled financial data scraping...');
    try {
      await this.fetchAndSaveFinancials();
      this.logger.log('Scheduled financial data scraping completed.');
    } catch (error) {
      this.logger.error(
        `Scheduled financial data scraping failed: ${error.message}`,
        error.stack,
      );
    }
  }

  private async processStock(stock: StockWithMarketCode): Promise<void> {
    try {
      const financialData = await this.httpService.fetchFinancialData(stock);
      if (financialData) {
        const processedData = this.dataService.processFinancialData(
          stock,
          financialData,
        );
        await this.dbService.saveFinancialData(processedData, stock);
        await this.dbService.markUrlAsProcessed(stock);
      }
    } catch (error) {
      this.logger.error(`Error processing ${stock.symbol}`, error);
    }
  }

  private async fetchAndSaveFinancials() {
    try {
      let page = 1;
      let totalProcessed = 0;
      const maxConcurrentRequests = process.env.MAX_CONCURRENT_REQUESTS
        ? parseInt(process.env.MAX_CONCURRENT_REQUESTS)
        : 5;
      const batchDelay = process.env.BATCH_DELAY
        ? parseInt(process.env.BATCH_DELAY)
        : 0;

      while (true) {
        const stocks = await this.dbService.getPaginatedStocks(page);
        if (!stocks.length) break;

        this.logger.log(
          `Processing page ${page} with ${stocks.length} stocks (Total processed so far: ${totalProcessed})`,
        );

        let index = 0;
        let pageProcessed = 0;

        const worker = async () => {
          while (index < stocks.length) {
            const currentIndex = index;
            index++;
            const stock = stocks[currentIndex];
            await this.processStock(stock);
            pageProcessed++;
          }
        };

        const workers: Promise<void>[] = [];
        for (let i = 0; i < maxConcurrentRequests; i++) {
          workers.push(worker());
        }
        await Promise.all(workers);

        totalProcessed += pageProcessed;
        this.logger.log(
          `Page ${page} completed. Successfully processed ${pageProcessed} stocks in this page.`,
        );
        page++;

        if (batchDelay > 0) {
          this.logger.log(`Waiting ${batchDelay}ms before next page...`);
          await sleep(batchDelay);
        }
      }

      this.logger.log(
        `Financial data processing completed. Total stocks processed: ${totalProcessed}`,
      );
    } catch (error) {
      this.logger.error('Fatal error during financial data processing', error);
      throw error;
    }
  }
}
