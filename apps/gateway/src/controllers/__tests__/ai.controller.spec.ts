import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { AiController } from '../ai.controller';
import {
  AIQueryDto,
  ChatQueryDto,
  AIResponseDto,
  ChatResponseDto,
} from '@investing/common';
import { of, throwError } from 'rxjs';

describe('AiController', () => {
  let controller: AiController;
  let aiService: ClientProxy;

  const mockAiService = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: 'AI_SERVICE',
          useValue: mockAiService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    aiService = module.get<ClientProxy>('AI_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processQuery', () => {
    const mockQueryDto: AIQueryDto = {
      model: 'gpt-4',
      prompt: 'What is the current price of Bitcoin?',
      market_context: {
        timeframe: '1d',
        dataType: 'price',
      },
      max_tokens: 100,
      temperature: 0.7,
    };

    const mockResponse: AIResponseDto = {
      text: 'Bitcoin price is $50,000',
      usage: {
        prompt_tokens: 20,
        completion_tokens: 15,
        total_tokens: 35,
      },
      model: 'gpt-4',
    };

    it('should successfully process a query', async () => {
      mockAiService.send.mockReturnValueOnce(of(mockResponse));

      const result = await controller.processQuery(mockQueryDto);

      expect(result).toEqual(mockResponse);
      expect(mockAiService.send).toHaveBeenCalledWith(
        { cmd: 'ai.query' },
        mockQueryDto,
      );
    });

    it('should handle connection refused error', async () => {
      const error = new Error();
      error['code'] = 'ECONNREFUSED';
      mockAiService.send.mockReturnValueOnce(throwError(() => error));

      await expect(controller.processQuery(mockQueryDto)).rejects.toThrow(
        'AI service is temporarily unavailable',
      );
    });

    it('should handle timeout error', async () => {
      const error = new Error();
      error.name = 'TimeoutError';
      mockAiService.send.mockReturnValueOnce(throwError(() => error));

      await expect(controller.processQuery(mockQueryDto)).rejects.toThrow(
        'Request timed out',
      );
    });

    it('should handle generic error', async () => {
      const error = new Error('Unknown error');
      mockAiService.send.mockReturnValueOnce(throwError(() => error));

      await expect(controller.processQuery(mockQueryDto)).rejects.toThrow(
        'Failed to process query',
      );
    });
  });

  describe('chat', () => {
    const mockChatDto: ChatQueryDto = {
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: 'Tell me about market trends',
        },
      ],
      market_context: {
        timeframe: '1d',
      },
      max_tokens: 100,
    };

    const mockResponse: ChatResponseDto = {
      message: {
        role: 'assistant',
        content: 'The market is showing bullish trends',
      },
      usage: {
        prompt_tokens: 25,
        completion_tokens: 20,
        total_tokens: 45,
      },
      model: 'gpt-4',
    };

    it('should successfully process a chat message', async () => {
      mockAiService.send.mockReturnValueOnce(of(mockResponse));

      const result = await controller.chat(mockChatDto);

      expect(result).toEqual(mockResponse);
      expect(mockAiService.send).toHaveBeenCalledWith(
        { cmd: 'ai.chat' },
        mockChatDto,
      );
    });

    it('should handle connection refused error', async () => {
      const error = new Error();
      error['code'] = 'ECONNREFUSED';
      mockAiService.send.mockReturnValueOnce(throwError(() => error));

      await expect(controller.chat(mockChatDto)).rejects.toThrow(
        'AI chat service is temporarily unavailable',
      );
    });

    it('should handle timeout error', async () => {
      const error = new Error();
      error.name = 'TimeoutError';
      mockAiService.send.mockReturnValueOnce(throwError(() => error));

      await expect(controller.chat(mockChatDto)).rejects.toThrow(
        'Chat request timed out',
      );
    });

    it('should handle generic error', async () => {
      const error = new Error('Unknown error');
      mockAiService.send.mockReturnValueOnce(throwError(() => error));

      await expect(controller.chat(mockChatDto)).rejects.toThrow(
        'Failed to process chat',
      );
    });
  });
});
