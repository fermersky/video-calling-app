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
  IEventData,
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

    console.log(user);

    this._users.push(user);
    client.emit('welcome', user);
  }

  @SubscribeMessage('try-call')
  onTryCall(
    @MessageBody() data: ICallSignature,
    @ConnectedSocket() client: Socket,
  ) {
    const receiver = this._users.getById(data.targetUid);

    console.log({targetId: data.targetUid, receiver})

    if (receiver && receiver.uid !== data.initiatorUid) {
      return this.server.to(receiver.socketId).emit('incoming-call', data);
    }

    return client.emit('user-is-not-joined');
  }

  @SubscribeMessage('accept-call')
  onAcceptCall(
    @MessageBody() data: ICallSignature,
    @ConnectedSocket() socket: Socket,
  ) {
    this._findTargetAndEmit('accept-call', data, socket);
  }

  @SubscribeMessage('drop-call')
  async onDropCall(
    @MessageBody() data: ICallSignature,
    @ConnectedSocket() socket: Socket,
  ) {
    this._findTargetAndEmit('drop-call', data, socket);
  }

  @SubscribeMessage('video-offer')
  async onVideoOffer(
    @MessageBody() data: IOffer,
    @ConnectedSocket() socket: Socket,
  ) {
    this._findTargetAndEmit('video-offer', data, socket);
  }

  @SubscribeMessage('video-screen-sharing-offer')
  async onVideoScreenSharingOffer(
    @MessageBody() data: IOffer,
    @ConnectedSocket() socket: Socket,
  ) {
    this._findTargetAndEmit('video-screen-sharing-offer', data, socket);
  }

  @SubscribeMessage('video-screen-sharing-answer')
  async onVideoScreenSharingAnswer(
    @MessageBody() data: IOffer,
    @ConnectedSocket() socket: Socket,
  ) {
    this._findTargetAndEmit('video-screen-sharing-answer', data, socket);
  }

  @SubscribeMessage('video-answer')
  async onVideoAnswer(
    @MessageBody() data: IAnswer,
    @ConnectedSocket() socket: Socket,
  ) {
    this._findTargetAndEmit('video-answer', data, socket);
  }

  @SubscribeMessage('ice-candidate')
  async onIceCandidate(
    @MessageBody() data: ICandidate,
    @ConnectedSocket() socket: Socket,
  ) {
    this._findTargetAndEmit('ice-candidate', data, socket);
  }

  @SubscribeMessage('ice-screen-sharing-candidate')
  async onIceScreenSharingCandidate(
    @MessageBody() data: ICandidate,
    @ConnectedSocket() socket: Socket,
  ) {
    this._findTargetAndEmit('ice-screen-sharing-candidate', data, socket);
  }

  @SubscribeMessage('start-screen-sharing')
  async onParticipantStartsScreenSharing(
    @MessageBody() data: ICandidate,
    @ConnectedSocket() socket: Socket,
  ) {
    this._findTargetAndEmit('participant-starts-screen-sharing', data, socket);
  }

  @SubscribeMessage('stop-screen-sharing')
  async onParticipantStopsScreenSharing(
    @MessageBody() data: ICandidate,
    @ConnectedSocket() socket: Socket,
  ) {
    this._findTargetAndEmit('participant-stops-screen-sharing', data, socket);
  }

  private _findTargetAndEmit(event: string, data: IEventData, socket: Socket) {
    const receiver = this._users.getById(data.targetUid);

    if (receiver && receiver.uid !== data.initiatorUid) {
      return socket.to(receiver.socketId).emit(event, data);
    }
  }

  public handleDisconnect(client: Socket) {
    this._users.remove(this.socketIdToUid(client.id));
  }

  private socketIdToUid(longId: string): string {
    return longId.substr(0, 4).toLowerCase();
  }
}
