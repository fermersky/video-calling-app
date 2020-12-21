import { Socket } from 'socket.io';

export interface IUser {
  name: string;
  uid: string;
  socketId: string;
}

export interface IOffer {
  initiatorUid: string;
  sdp: string;
  targetUid: string;
}

export interface IAnswer extends IOffer {}

export interface ICandidate {
  initiatorUid: string;
  candidate: string;
  targetUid: string;
}

export interface ICallSignature {
  username: string;
  initiatorUid: string;
  targetUid: string;
}
