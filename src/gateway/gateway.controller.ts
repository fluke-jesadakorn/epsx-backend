import { Controller, Get, Post, Body, Res, Inject } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AiQueryDto } from '../modules/ai-service/dto/ai-query.dto';
import { ChatQueryDto } from '../modules/ai-service/dto/chat-query.dto';

@Controller()
@ApiTags('Gateway')
export class GatewayController {
  constructor(
    @Inject('STOCK_SERVICE') private readonly stockClient: ClientProxy,
    @Inject('EXCHANGE_SERVICE') private readonly exchangeClient: ClientProxy,
    @Inject('AI_SERVICE') private readonly aiClient: ClientProxy
  ) {}

  @Get('stock/scrape')
  @ApiOperation({
    summary: 'Scrape stock data',
    description: 'Fetches and saves stock data through the stock microservice'
  })
  @ApiResponse({
    status: 200,
    description: 'Stock data scraped successfully'
  })
  async scrapeStocks() {
    return this.stockClient.send('scrape_stocks', {});
  }

  @Get('exchange/scrape')
  @ApiOperation({
    summary: 'Scrape exchange data',
    description: 'Fetches and saves exchange data through the exchange microservice'
  })
  @ApiResponse({
    status: 200,
    description: 'Exchange data scraped successfully'
  })
  async scrapeExchanges() {
    return this.exchangeClient.send('scrape_exchanges', {});
  }

  @Get('logs')
  serveLogsViewer(@Res() res: Response) {
    res.sendFile(join(process.cwd(), 'public/index.html'));
  }

  @Post('ai/query')
  @ApiOperation({
    summary: 'Process AI query',
    description: 'Process natural language queries using AI service to analyze financial data'
  })
  @ApiBody({
    type: AiQueryDto,
    description: 'AI query request with optional processing options',
    examples: {
      basic: {
        summary: 'Basic Query',
        value: {
          query: 'Show me tech companies with revenue over 1 million dollars',
          options: {
            limit: 10
          }
        }
      },
      detailed: {
        summary: 'Detailed Query',
        value: {
          query: 'Compare the EBITDA margins of AAPL and MSFT for the last fiscal year',
          options: {
            limit: 2
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Query processed successfully',
    schema: {
      example: {
        results: [
          {
            symbol: 'AAPL',
            company_name: 'Apple Inc.',
            revenue: 1000000000,
            sector: 'Technology'
          }
        ],
        metadata: {
          query_time: '0.5s',
          total_results: 1
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query format or parameters'
  })
  async processAiQuery(@Body() queryDto: AiQueryDto) {
    return this.aiClient.send('ai.query', queryDto);
  }

  @Post('ai/chat')
  @ApiOperation({
    summary: 'Process chat messages',
    description: 'Handle interactive chat conversations with AI service for financial analysis'
  })
  @ApiBody({
    type: ChatQueryDto,
    description: 'Chat message with conversation history and optional AI parameters',
    examples: {
      basic: {
        summary: 'Single Message',
        value: {
          messages: [
            {
              role: 'user',
              content: 'What is the latest financial data for Apple?'
            }
          ]
        }
      },
      conversation: {
        summary: 'Conversation Thread',
        value: {
          messages: [
            {
              role: 'user',
              content: 'What is Apple\'s revenue?'
            },
            {
              role: 'assistant',
              content: 'Apple\'s revenue for the last fiscal year was $394.3 billion.'
            },
            {
              role: 'user',
              content: 'How does that compare to Microsoft?'
            }
          ],
          options: {
            temperature: 0.7,
            maxTokens: 500
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Chat message processed successfully',
    schema: {
      example: {
        response: {
          role: 'assistant',
          content: 'Based on the latest financial data, Apple\'s revenue was $394.3 billion while Microsoft\'s revenue was $211.9 billion.'
        },
        metadata: {
          processing_time: '0.8s',
          token_usage: 128
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid message format or conversation context'
  })
  async processChat(@Body() chatDto: ChatQueryDto) {
    return this.aiClient.send('ai.chat', chatDto);
  }
}
