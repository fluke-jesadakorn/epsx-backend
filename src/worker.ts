import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CloudflareWorkerAdapter } from './adapters/cloudflare-worker.adapter';

export interface Env {
  // Define your environment variables here
  DATABASE_URL?: string;
  SUPABASE_URL?: string;
  SUPABASE_KEY?: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

let app: any = null;
let adapter: CloudflareWorkerAdapter | null = null;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      if (!app || !adapter) {
        // Create and initialize the NestJS app only once
        adapter = new CloudflareWorkerAdapter();
        app = await NestFactory.create(AppModule, adapter);
        
        // Enable CORS
        app.enableCors();
        
        // Initialize the app
        await app.init();
      }
      
      // Handle the request using the adapter
      const response = await adapter!.reply(new Response(), request);
      return response;
    } catch (error) {
      // Handle any errors
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

// Add a comment for future features
/* TODO: Future enhancements
 * 1. Add request caching using Cloudflare KV
 * 2. Implement rate limiting
 * 3. Add request logging and monitoring
 * 4. Add WebSocket support for real-time updates
 * 5. Implement edge caching strategies
 */
