import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Financial } from '../schemas/financial.schema';

export interface FetchState {
  currentPage: number;
  totalProcessed: number;
  lastProcessedStock?: string | null;
  lastUpdated: string;
}

@Injectable()
export class FetchStateService {
  private readonly stateKey = 'financial_fetch_state';
  private state: FetchState = {
    currentPage: 1,
    totalProcessed: 0,
    lastProcessedStock: null,
    lastUpdated: new Date().toISOString(),
  };

  constructor(
    @InjectModel(Financial.name)
    private readonly financialModel: Model<Financial>,
  ) {}

  async loadState(): Promise<FetchState> {
    try {
      return this.state;
    } catch (error) {
      // If no state exists, return default state
      return this.state;
    }
  }

  async saveState(state: FetchState): Promise<void> {
    this.state = state;
  }

  async clearState(): Promise<void> {
    this.state = {
      currentPage: 1,
      totalProcessed: 0,
      lastProcessedStock: null,
      lastUpdated: new Date().toISOString(),
    };
  }
}
