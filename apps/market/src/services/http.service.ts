import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
    });
  }

  async fetchStockScreener<T>(marketCode: string): Promise<T | null> {
    try {
      const response = await this.axiosInstance.get(
        `https://stockanalysis.com/api/screener/s/${marketCode}`,
      );
      return response.data as T;
    } catch (error) {
      this.logger.error(
        `Error fetching stock data for ${marketCode}: ${error.message}`,
      );
      return null;
    }
  }
}
