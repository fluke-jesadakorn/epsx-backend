import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as net from 'net';

export interface ServiceInfo {
  name: string;
  host: string;
  port: number;
  lastHeartbeat: number;
  status: 'ACTIVE' | 'INACTIVE';
}

@Injectable()
export class ServiceRegistry implements OnModuleDestroy {
  private services: Map<string, ServiceInfo> = new Map();
  private readonly heartbeatInterval = 10000; // 10 seconds
  private readonly heartbeatTimeout = 30000; // 30 seconds
  private destroy$ = new Subject<void>();

  constructor() {
    this.startHeartbeatCheck();
  }

  /**
   * Register a new service
   * @param name Service name
   * @param host Service host
   * @param port Service port
   */
  registerService(name: string, host: string, port: number): void {
    this.services.set(name, {
      name,
      host,
      port,
      lastHeartbeat: Date.now(),
      status: 'ACTIVE',
    });
  }

  /**
   * Deregister a service and release its resources
   * @param name Service name
   */
  async deregisterService(name: string): Promise<void> {
    const service = this.services.get(name);
    if (service) {
      try {
        // Try to gracefully close any open connections
        await this.closeServiceConnections(service.host, service.port);
        this.services.delete(name);
      } catch (error) {
        console.error(`Error deregistering service ${name}:`, error);
        throw error;
      }
    }
  }

  /**
   * Update service heartbeat
   * @param name Service name
   */
  updateHeartbeat(name: string): void {
    const service = this.services.get(name);
    if (service) {
      service.lastHeartbeat = Date.now();
      service.status = 'ACTIVE';
      this.services.set(name, service);
    }
  }

  /**
   * Get service information
   * @param name Service name
   */
  getService(name: string): ServiceInfo | undefined {
    return this.services.get(name);
  }

  /**
   * Get all registered services
   */
  getAllServices(): ServiceInfo[] {
    return Array.from(this.services.values());
  }

  /**
   * Check service availability
   * @param name Service name
   */
  async isServiceAvailable(name: string): Promise<boolean> {
    const service = this.services.get(name);
    if (!service) return false;

    try {
      const isAvailable = await this.checkConnection(
        service.host,
        service.port,
      );
      service.status = isAvailable ? 'ACTIVE' : 'INACTIVE';
      this.services.set(name, service);
      return isAvailable;
    } catch {
      service.status = 'INACTIVE';
      this.services.set(name, service);
      return false;
    }
  }

  private startHeartbeatCheck(): void {
    interval(this.heartbeatInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const now = Date.now();
        for (const [name, service] of this.services.entries()) {
          if (now - service.lastHeartbeat > this.heartbeatTimeout) {
            service.status = 'INACTIVE';
            this.services.set(name, service);
          }
        }
      });
  }

  private async closeServiceConnections(
    host: string,
    port: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();

      socket.setTimeout(1000);

      socket.on('error', () => {
        socket.destroy();
        resolve(); // Resolve anyway as the port might already be closed
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve();
      });

      socket.on('connect', () => {
        socket.end(() => {
          socket.destroy();
          resolve();
        });
      });

      socket.connect(port, host);
    });
  }

  private checkConnection(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();

      socket.setTimeout(1000); // 1 second timeout

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(port, host);
    });
  }

  onModuleDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
