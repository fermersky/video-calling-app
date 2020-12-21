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
import {
  IOffer,
  ICallSignature,
  IUser,
  IAnswer,
  ICandidate,
} from './interfaces';

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
      return this.server.to(receiver.socketId).emit('incoming-call', data);
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
      return this.server.to(receiver.socketId).emit('accept-call', data);
    }
  }

  @SubscribeMessage('drop-call')
  async onDropCall(
    @MessageBody() data: ICallSignature,
    @ConnectedSocket() client: Socket,
  ) {
    const receiver = this._users.getById(data.targetUid);

    if (receiver && receiver.uid !== data.initiatorUid) {
      return this.server.to(receiver.socketId).emit('drop-call', data);
    }
  }

  @SubscribeMessage('video-offer')
  async onVideoOffer(
    @MessageBody() data: IOffer,
    @ConnectedSocket() client: Socket,
  ) {
    const receiver = this._users.getById(data.targetUid);
    console.log(receiver, this._users.getAll());

    if (receiver && receiver.uid !== data.initiatorUid) {
      return this.server.to(receiver.socketId).emit('video-offer', data);
    }
  }

  @SubscribeMessage('video-answer')
  async onVideoAnswer(
    @MessageBody() data: IAnswer,
    @ConnectedSocket() client: Socket,
  ) {
    const receiver = this._users.getById(data.targetUid);

    if (receiver && receiver.uid !== data.initiatorUid) {
      return this.server.to(receiver.socketId).emit('video-answer', data);
    }
  }

  @SubscribeMessage('ice-candidate')
  async onIceCandidate(
    @MessageBody() data: ICandidate,
    @ConnectedSocket() client: Socket,
  ) {
    const receiver = this._users.getById(data.targetUid);

    if (receiver && receiver.uid !== data.initiatorUid) {
      return this.server.to(receiver.socketId).emit('ice-candidate', data);
    }
  }

  handleDisconnect(client: Socket) {
    this._users.remove(this.socketIdToUid(client.id));
  }

  private socketIdToUid(longId: string): string {
    return longId.substr(0, 4).toLowerCase();
  }
}
