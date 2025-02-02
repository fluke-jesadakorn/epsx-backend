import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

/**
 * WebSocket gateway for real-time database operation logs
 * 
 * Future features that could be implemented:
 * - Add filtering options for specific log types (exchange, stock, financial)
 * - Add search functionality to find specific logs
 * - Add timestamp filtering to view logs from specific time periods
 * - Add export functionality to download logs as JSON/CSV
 * - Add authentication to secure the logs viewer
 * - Add persistent storage of logs with pagination
 * - Add error log highlighting and categorization
 * - Add log level filtering (debug, info, warn, error)
 */
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // For development purposes only
  },
})
export class LogsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(LogsGateway.name);
  private clients: Socket[] = [];

  handleConnection(client: Socket) {
    this.clients.push(client);
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.clients = this.clients.filter(c => c.id !== client.id);
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  // Method to broadcast logs to all connected clients
  broadcastLog(log: any) {
    this.server.emit('log', log);
  }
}
