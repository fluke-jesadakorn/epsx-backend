import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateExchangeRequest, UpdateExchangeRequest, ExchangeResponse, PaginatedExchangeResponse, ScrapeExchangeResponse } from '../swagger/entities/exchange.swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Exchange')
@Controller('exchange')
export class ExchangeController {
  constructor(
    @Inject('EXCHANGE_SERVICE') private readonly exchangeService: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new exchange' })
  @ApiBody({ type: CreateExchangeRequest })
  @ApiResponse({ status: 201, description: 'Exchange created successfully', type: ExchangeResponse })
  @ApiResponse({ status: 400, description: 'Invalid exchange data' })
  async create(@Body() exchangeData: CreateExchangeRequest) {
    return firstValueFrom(
      this.exchangeService.send({ cmd: 'createExchange' }, exchangeData)
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all exchanges with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of exchanges retrieved successfully', type: PaginatedExchangeResponse })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    try {
      console.log('Gateway: Sending findAllExchanges request', { page, limit });
      const timeout = 5000; // 5 seconds timeout
      const result = await Promise.race([
        firstValueFrom(
          this.exchangeService.send(
            { cmd: 'findAllExchanges' },
            { page, limit }
          )
        ),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        ),
      ]);
      console.log('Gateway: Received response from exchange service:', result);
      return result;
    } catch (error) {
      console.error('Gateway: Error in findAll:', error);
      throw error;
    }
  }

  @Get(':marketCode')
  @ApiOperation({ summary: 'Get exchange by market code' })
  @ApiParam({ name: 'marketCode', type: String, description: 'Market code of the exchange' })
  @ApiResponse({ status: 200, description: 'Exchange found', type: ExchangeResponse })
  @ApiResponse({ status: 404, description: 'Exchange not found' })
  async findOne(@Param('marketCode') marketCode: string) {
    return firstValueFrom(
      this.exchangeService.send({ cmd: 'findOneExchange' }, marketCode)
    );
  }

  @Put(':marketCode')
  @ApiOperation({ summary: 'Update an exchange' })
  @ApiParam({ name: 'marketCode', type: String, description: 'Market code of the exchange' })
  @ApiBody({ type: UpdateExchangeRequest })
  @ApiResponse({ status: 200, description: 'Exchange updated successfully', type: ExchangeResponse })
  @ApiResponse({ status: 404, description: 'Exchange not found' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  async update(
    @Param('marketCode') marketCode: string,
    @Body() updateData: UpdateExchangeRequest
  ) {
    return firstValueFrom(
      this.exchangeService.send(
        { cmd: 'updateExchange' },
        { marketCode, updateData }
      )
    );
  }

  @Delete(':marketCode')
  @ApiOperation({ summary: 'Delete an exchange' })
  @ApiParam({ name: 'marketCode', type: String, description: 'Market code of the exchange' })
  @ApiResponse({ status: 200, description: 'Exchange deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exchange not found' })
  async remove(@Param('marketCode') marketCode: string) {
    return firstValueFrom(
      this.exchangeService.send({ cmd: 'removeExchange' }, marketCode)
    );
  }

  @Post('scrape')
  @ApiOperation({ summary: 'Scrape and save exchange data' })
  @ApiResponse({ status: 200, description: 'Exchange data scraped successfully', type: ScrapeExchangeResponse })
  @ApiResponse({ status: 500, description: 'Scraping failed' })
  async scrapeExchanges() {
    return firstValueFrom(
      this.exchangeService.send({ cmd: 'scrapeExchanges' }, {})
    );
  }

  // TODO: Add endpoints for:
  // - Real-time exchange rate updates
  // - Market status checks
  // - Trading hours information
  // - Holiday calendar
}
