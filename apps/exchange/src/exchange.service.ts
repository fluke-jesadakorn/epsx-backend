import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { chromium } from 'playwright';
import { Exchange } from './schemas/exchange.schema';

@Injectable()
export class ExchangeService {
  constructor(
    @InjectModel(Exchange.name)
    private readonly exchangeModel: Model<Exchange>,
  ) {}

  // Create
  async create(exchangeData: Partial<Exchange>) {
    const existingExchange = await this.exchangeModel
      .findOne({ market_code: exchangeData.market_code })
      .exec();

    if (existingExchange) {
      throw new Error(`Exchange with market code ${exchangeData.market_code} already exists`);
    }

    const exchange = new this.exchangeModel(exchangeData);
    return exchange.save();
  }

  // Read
  async findAll(skip = 0, limit = 10) {
    try {
      console.log('findAll called with:', { skip, limit });
      console.log('MongoDB URI:', process.env.MONGODB_URI);
      console.log('MongoDB DB Name:', process.env.MONGODB_DB_NAME);
      
      const [data, total] = await Promise.all([
        this.exchangeModel.find().skip(skip).limit(limit).lean().exec(),
        this.exchangeModel.countDocuments().exec(),
      ]).catch(err => {
        console.error('MongoDB operation failed:', err);
        throw err;
      });

      console.log('Found data:', { count: data?.length, total });
      
      if (!data || data.length === 0) {
        console.log('No data found, attempting to seed...');
        // Seed initial data if no exchanges exist
        const sampleExchange = {
          exchange_name: 'New York Stock Exchange',
          country: 'United States',
          market_code: 'NYSE',
          currency: 'USD',
          exchange_url: 'https://www.nyse.com',
          timezone: 'America/New_York'
        };

        await this.create(sampleExchange);
        
        // Fetch again after seeding
        const [newData, newTotal] = await Promise.all([
          this.exchangeModel.find().skip(skip).limit(limit).lean().exec(),
          this.exchangeModel.countDocuments().exec(),
        ]);
        
        const result = { data: newData, total: newTotal, page: Math.floor(skip / limit) + 1, limit };
      console.log('Returning result:', result);
      return result;
      }

      return { data, total, page: Math.floor(skip / limit) + 1, limit };
    } catch (error) {
      console.error('Error in findAll:', error);
      console.error('findAll error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });
      throw new Error(`Failed to fetch exchanges: ${error.message}`);
    }
  }

  async findOne(marketCode: string) {
    const exchange = await this.exchangeModel.findOne({ market_code: marketCode }).exec();
    if (!exchange) {
      throw new NotFoundException(`Exchange with market code ${marketCode} not found`);
    }
    return exchange;
  }

  // Update
  async update(marketCode: string, updateData: Partial<Exchange>) {
    const exchange = await this.exchangeModel
      .findOneAndUpdate({ market_code: marketCode }, updateData, { new: true })
      .exec();
    
    if (!exchange) {
      throw new NotFoundException(`Exchange with market code ${marketCode} not found`);
    }
    return exchange;
  }

  // Delete
  async remove(marketCode: string) {
    const exchange = await this.exchangeModel
      .findOneAndDelete({ market_code: marketCode })
      .exec();
    
    if (!exchange) {
      throw new NotFoundException(`Exchange with market code ${marketCode} not found`);
    }
    return exchange;
  }

  // Legacy scraping functionality
  async scrapeAndSaveExchanges() {
    const browser = await chromium.launch({
      headless: process.env.HEADLESS_MODE !== 'false',
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
            timezone: 'UTC',
          })),
      );

      if (exchanges.length === 0) {
        throw new Error('No exchanges found');
      }

      let newCount = 0;
      let updateCount = 0;

      for (const exchangeData of exchanges) {
        try {
          const existingExchange = await this.exchangeModel
            .findOne({ market_code: exchangeData.market_code })
            .exec();

          if (existingExchange) {
            await this.update(exchangeData.market_code, exchangeData);
            updateCount++;
          } else {
            await this.create(exchangeData);
            newCount++;
          }
        } catch (error) {
          console.error(`Failed to save exchange ${exchangeData.market_code}:`, error);
        }
      }

      return { newCount, updateCount, total: await this.exchangeModel.countDocuments().exec() };
    } catch (error) {
      console.error('Failed to scrape exchanges:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }
}
