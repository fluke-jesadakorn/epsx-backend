// AI Service Interfaces

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface AIQueryParams {
  model: string;
  prompt: string;
  market_context?: any;
  max_tokens?: number;
  temperature?: number;
}

export interface ChatQueryParams {
  model: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  market_context?: any;
  max_tokens?: number;
  temperature?: number;
}

export interface AIResponse {
  text: string;
  usage: TokenUsage;
  model: string;
  created_at: Date;
}

export interface ChatResponse {
  message: {
    role: "system" | "user" | "assistant";
    content: string;
  };
  usage: TokenUsage;
  model: string;
  created_at: Date;
}
