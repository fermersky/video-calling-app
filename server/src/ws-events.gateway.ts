import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Socket } from 'dgram';

@WebSocketGateway()
export class WebsocketsEventsGateway implements OnGatewayConnection {
  handleConnection(client: Socket, ...args: any[]) {
    client.emit('join', 'you are connected');
  }
  @WebSocketServer() server;

  @SubscribeMessage('chat')
  async onChat(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    client.emit('chat', data);
  }
}
