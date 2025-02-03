import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { chromium } from 'playwright';
import { Exchange } from '../../entities/exchange.entity';
import { logger } from '../../utils/logger';

// TODO: Future Feature - Add caching layer to reduce database load
// TODO: Future Feature - Add rate limiting for scraping to avoid being blocked

@Injectable()
export class ExchangeService {
  constructor(
    @InjectRepository(Exchange)
    private readonly exchangeRepository: Repository<Exchange>
  ) {}

  async scrapeAndSaveExchanges() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto("https://stockanalysis.com/list/exchanges/", {
        waitUntil: "networkidle",
      });

      const table = await page.waitForSelector("#main > div > div > table");
      if (!table) {
        throw new Error("Table not found");
      }

      const exchanges = await page.$$eval<Exchange[], HTMLTableRowElement>(
        "#main > div > div > table tbody tr",
        (rows) =>
          rows.map((row) => ({
            exchange_name: row.querySelectorAll("td")[0].innerText.trim(),
            country: row.querySelectorAll("td")[1].innerText.trim(),
            market_code: row.querySelectorAll("td")[2].innerText.trim(),
            currency: row.querySelectorAll("td")[3].innerText.trim(),
            stocks: row.querySelectorAll("td")[4].innerText.trim(),
            exchange_url:
              row.querySelectorAll("td")[0].querySelector("a")?.href.trim() || "",
          }))
      );

      if (exchanges.length === 0) {
        throw new Error("No exchanges found");
      }

      logger.info(`Found ${exchanges.length} exchanges`);

      let newCount = 0;
      let updateCount = 0;

      for (const exchange of exchanges) {
        try {
          const existingExchange = await this.exchangeRepository.findOne({
            where: { market_code: exchange.market_code }
          });

          if (existingExchange) {
            await this.exchangeRepository.update(
              { market_code: exchange.market_code },
              exchange
            );
            updateCount++;
            logger.info(`Updated exchange: ${exchange.market_code}`);
          } else {
            await this.exchangeRepository.save(exchange);
            newCount++;
            logger.info(`Added new exchange: ${exchange.market_code}`);
          }
        } catch (error) {
          logger.error(
            `Failed to save exchange ${exchange.market_code}:`,
            error
          );
        }
      }

      logger.info(
        `Operation completed. Added ${newCount} new exchanges, updated ${updateCount} existing exchanges.`
      );

      const totalCount = await this.exchangeRepository.count();
      logger.info(`Total exchanges in database: ${totalCount}`);
    } catch (error) {
      logger.error("Failed to scrape exchanges:", error);
      throw error;
    } finally {
      await browser.close();
    }
  }
}
