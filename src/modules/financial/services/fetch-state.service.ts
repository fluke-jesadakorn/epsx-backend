import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { logger } from '../../../utils/logger';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';

export interface FetchState {
  currentPage: number;
  totalProcessed: number;
  lastProcessedStock: string | null;
  lastUpdated: string;
}

@Injectable()
export class FetchStateService {
  private readonly statePath: string;

  constructor() {
    this.statePath = join(__dirname, '../fetch-state.json');
  }

  async loadState(): Promise<FetchState> {
    try {
      if (existsSync(this.statePath)) {
        const state = JSON.parse(await fs.readFile(this.statePath, 'utf8'));
        return state;
      }
    } catch (error) {
      logger.warn('Could not load fetch state, starting fresh', error);
    }
    
    return {
      currentPage: 1,
      totalProcessed: 0,
      lastProcessedStock: null,
      lastUpdated: new Date().toISOString()
    };
  }

  async saveState(state: FetchState): Promise<void> {
    try {
      await fs.writeFile(this.statePath, JSON.stringify(state, null, 2));
      logger.info(`Saved fetch state: Page ${state.currentPage}, Processed ${state.totalProcessed} stocks`);
    } catch (error) {
      logger.error('Failed to save fetch state', error);
    }
  }

  async clearState(): Promise<void> {
    try {
      if (existsSync(this.statePath)) {
        await fs.unlink(this.statePath);
        logger.info('Cleared fetch state after successful completion');
      }
    } catch (error) {
      logger.error('Failed to clear fetch state', error);
    }
  }
}
