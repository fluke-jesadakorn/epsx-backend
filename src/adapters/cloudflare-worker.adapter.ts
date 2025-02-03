import { AbstractHttpAdapter } from '@nestjs/core';
import { RequestMethod, VersioningOptions, VERSION_NEUTRAL } from '@nestjs/common';
import type { VersionValue } from '@nestjs/common/interfaces';

export class CloudflareWorkerAdapter extends AbstractHttpAdapter<Request, Response> {
  constructor() {
    super();
  }

  public initHttpServer() {
    // Not needed for Workers
  }

  public useStaticAssets() {
    // Not supported in Workers
  }

  public setViewEngine() {
    // Not supported in Workers
  }

  public getRequestHostname(request: Request): string {
    return new URL(request.url).hostname;
  }

  public getRequestIp(request: Request): string {
    // Return CF-Connecting-IP header if available
    return request.headers.get('CF-Connecting-IP') || '';
  }

  public getRequestPath(request: Request): string {
    return new URL(request.url).pathname;
  }

  public close() {
    // Not needed for Workers
  }

  public listen(port: string | number, hostname?: string | (() => void), callback?: () => void): any {
    if (typeof hostname === 'function') {
      hostname();
    } else if (callback) {
      callback();
    }
    return this;
  }

  public end(response: Response, chunk: any) {
    return new Response(chunk, {
      status: response.status,
      headers: response.headers,
    });
  }

  public isHeadersSent(response: Response): boolean {
    return response.headers.get('content-type') !== null;
  }

  public setHeader(response: Response, name: string, value: string) {
    const newHeaders = new Headers(response.headers);
    newHeaders.set(name, value);
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  }

  public registerParserMiddleware() {
    // Not needed for Workers
  }

  public enableCors(options: any) {
    // Implement CORS for Workers
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
    return new Response(null, { headers });
  }

  public applyVersionFilter(
    handler: Function, 
    version: VersionValue = VERSION_NEUTRAL, 
    versioningOptions: VersioningOptions
  ): (req: any, res: any, next: () => void) => Function {
    return (req: Response, res: any, next: () => void) => {
      // Simple pass-through for now since versioning is not critical for workers
      return handler(req, res, next);
    };
  }

  public async reply(response: Response, body: any, statusCode?: number): Promise<Response> {
    if (statusCode) {
      return new Response(body, { status: statusCode });
    }
    return new Response(body);
  }

  public status(response: Response, statusCode: number): Response {
    return new Response(null, { status: statusCode });
  }

  render(response: Response, view: string, options: any) {
    return undefined;
  }

  redirect(response: Response, statusCode: number, url: string) {
    return Response.redirect(url, statusCode);
  }

  setErrorHandler(handler: Function, prefix?: string) {
    // TODO: Implement error handling for workers
  }

  setNotFoundHandler(handler: Function, prefix?: string) {
    // TODO: Implement not found handling for workers
  }


  getRequestMethod(request: Request): string {
    return request.method;
  }

  getRequestUrl(request: Request): string {
    return request.url;
  }

  public async createMiddlewareFactory(
    requestMethod: RequestMethod,
  ): Promise<(path: string, callback: Function) => any> {
    return (path: string, callback: Function) => {
      callback(path);
    };
  }

  public getType(): string {
    return 'cloudflare-worker';
  }
}
