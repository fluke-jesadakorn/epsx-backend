import { Module, OnModuleInit } from '@nestjs/common';
import { setLogsGateway } from '../utils/logger';
import { GatewayService } from './gateway.service';
import { LogsGateway } from './logs.gateway';
import { GatewayController } from './gateway.controller';

@Module({
  providers: [GatewayService, LogsGateway],
  controllers: [GatewayController],
  exports: [GatewayService, LogsGateway],
})
export class GatewayModule implements OnModuleInit {
  constructor(private readonly logsGateway: LogsGateway) {}

  onModuleInit() {
    setLogsGateway(this.logsGateway);
  }
}
