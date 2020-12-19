import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectedUsersService } from './connected-users.service';
import { WebsocketsEventsGateway } from './ws-events.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, WebsocketsEventsGateway, ConnectedUsersService],
})
export class AppModule {}
