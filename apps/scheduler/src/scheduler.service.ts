import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @Inject('FINANCIAL_SERVICE') private readonly financialClient: ClientProxy,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Bangkok',
  })
  async handleFinancialDataProcessing() {
    try {
      this.logger.log('Initiating scheduled financial data processing task');
      
      // Call the financial service to process data
      const result = await lastValueFrom(
        this.financialClient.send({ cmd: 'scrapeFinancialData' }, {}),
      );
      
      this.logger.log(`Financial data processing completed: ${result}`);
    } catch (error) {
      this.logger.error('Financial data processing failed:', error);
      throw error;
    }
  }

  // Example of another scheduled task - can be enabled based on requirements
  /*
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyDataCleanup() {
    try {
      this.logger.log('Starting weekly data cleanup task');
      const result = await lastValueFrom(
        this.financialClient.send({ cmd: 'cleanupOldData' }, {}),
      );
      this.logger.log(`Weekly cleanup completed: ${result}`);
    } catch (error) {
      this.logger.error('Weekly cleanup failed:', error);
      throw error;
    }
  }
  */
}
