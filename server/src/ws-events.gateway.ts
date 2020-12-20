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
import { IOffer, ICallSignature, IUser } from './interfaces';

@WebSocketGateway()
export class WebsocketsEventsGateway implements OnGatewayDisconnect {
  @WebSocketServer() server;

  constructor(private _users: ConnectedUsersService) {}

  @SubscribeMessage('join')
  onJoin(@MessageBody() name: string, @ConnectedSocket() client: Socket) {
    const user: IUser = {
      name,
      socketId: client.id,
      uid: this.socketIdToUid(client.id),
    };

    this._users.push(user);
    client.emit('welcome', user);
  }

  @SubscribeMessage('try-call')
  onTryCall(
    @MessageBody() data: ICallSignature,
    @ConnectedSocket() client: Socket,
  ) {
    const receiver = this._users.getById(data.targetUid);

    if (receiver && receiver.uid !== data.initiatorUid) {
      return client.to(receiver.socketId).emit('incoming-call', data);
    }

    return client.emit('user-is-not-joined');
  }

  @SubscribeMessage('accept-call')
  onAcceptCall(
    @MessageBody() data: ICallSignature,
    @ConnectedSocket() client: Socket,
  ) {
    const receiver = this._users.getById(data.targetUid);

    if (receiver && receiver.uid !== data.initiatorUid) {
      return client.to(receiver.socketId).emit('accept-call', data);
    }
  }

  @SubscribeMessage('drop-call')
  async onDropCall(
    @MessageBody() data: ICallSignature,
    @ConnectedSocket() client: Socket,
  ) {
    const receiver = this._users.getById(data.targetUid);

    if (receiver && receiver.uid !== data.initiatorUid) {
      return client.to(receiver.socketId).emit('drop-call', data);
    }
  }

  @SubscribeMessage('video-offer')
  async onChat(@MessageBody() data: IOffer, @ConnectedSocket() client: Socket) {
    console.log(data);
  }

  handleDisconnect(client: Socket) {
    this._users.remove(this.socketIdToUid(client.id));
  }

  private socketIdToUid(longId: string): string {
    return longId.substr(0, 4).toLowerCase();
  }
}
