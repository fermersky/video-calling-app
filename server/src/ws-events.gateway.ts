import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ConnectedUsersService } from './connected-users.service';
import { IUser } from './interfaces';

@WebSocketGateway()
export class WebsocketsEventsGateway implements OnGatewayDisconnect {
  @WebSocketServer() server;

  constructor(private _users: ConnectedUsersService) {}

  @SubscribeMessage('join')
  onJoin(@MessageBody() name: string, @ConnectedSocket() client: Socket) {
    const user: IUser = { name, uid: this.socketIdToUid(client.id) };

    this._users.push(user);
    client.emit('welcome', user);
  }

  @SubscribeMessage('video-offer')
  async onChat(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    client.emit('chat', data);
  }

  handleDisconnect(client: Socket) {
    this._users.remove(this.socketIdToUid(client.id));
  }

  private socketIdToUid(longId: string): string {
    return longId.substr(0, 4).toLowerCase();
  }
}
