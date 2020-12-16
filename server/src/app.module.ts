import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketsEventsGateway } from './ws-events.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, WebsocketsEventsGateway],
})
export class AppModule {}
