import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(`Making request to ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      },
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`Received response from ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error('Response error:', error);
        return Promise.reject(error);
      },
    );
  }

  async fetchStockScreener<T>(marketCode: string): Promise<T | null> {
    try {
      const baseUrl = process.env.STOCK_SCREENER_API_URL;
      const response = await this.axiosInstance.get(
        `${baseUrl}/stocks/${marketCode}`,
      );
      return response.data as T;
    } catch (error) {
      this.logger.error(`Error fetching stock screener data: ${error.message}`);
      return null;
    }
  }

  // TODO: Add methods for:
  // - Real-time price updates API
  // - Historical data API
  // - Market indicators API
  // - Company fundamentals API
}
