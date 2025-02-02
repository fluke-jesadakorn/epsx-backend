import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { DatabaseService } from "../src/services/database";
import { Exchange } from "../src/types";
import { logger } from "../src/utils/logger";

test.describe("Exchange Scraping", () => {
  let db: DatabaseService;

  test.beforeAll(async () => {
    db = DatabaseService.getInstance();
  });

  test("should scrape exchanges and save to database", async ({ page }) => {
    // Navigate to the exchanges page
    await page.goto("https://stockanalysis.com/list/exchanges/", {
      waitUntil: "networkidle",
    });

    // Wait for the table to appear and ensure it's loaded
    const table = await page.waitForSelector("#main > div > div > table");
    expect(table).toBeTruthy();

    // Extract exchange data
    const exchanges = await page.$$eval<Exchange[], HTMLTableRowElement>(
      "#main > div > div > table tbody tr",
      (rows) =>
        rows.map((row) => ({
          exchange_name: row.querySelectorAll("td")[0].innerText.trim(),
          country: row.querySelectorAll("td")[1].innerText.trim(),
          code: row.querySelectorAll("td")[2].innerText.trim(),
          currency: row.querySelectorAll("td")[3].innerText.trim(),
          stocks: row.querySelectorAll("td")[4].innerText.trim(),
        }))
    );

    // Validate scraped data
    expect(exchanges.length).toBeGreaterThan(0);
    expect(exchanges[0]).toHaveProperty("exchange_name");
    expect(exchanges[0]).toHaveProperty("code");
    expect(exchanges[0]).toHaveProperty("code");
    expect(exchanges[0]).toHaveProperty("code");

    // Save each exchange to Supabase
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    for (const exchange of exchanges) {
      try {
        const { data, error } = await supabase
          .from("exchanges")
          .upsert(exchange);

        if (error) {
          throw error;
        }

        logger.info(`Successfully saved exchange: ${exchange.code}`);
      } catch (error) {
        logger.error(
          `Failed to save exchange ${exchange.code}:`,
          error as Error
        );
        throw error;
      }
    }

    // Verify data was saved
    const savedExchanges = await db.getExchanges();
    expect(savedExchanges.length).toBeGreaterThan(0);
  });
});

// TODO: Future enhancements
// - Add validation for exchange data format
// - Implement rate limiting for API calls
// - Add retry mechanism for failed scrapes
// - Add data comparison with existing records
// - Implement change tracking
// - Add automatic update scheduling
// - Add data backup before updates
