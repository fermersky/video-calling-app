export interface IEventData {
  targetUid: string;
  initiatorUid: string;
}
export interface IUser {
  name: string;
  uid: string;
  socketId: string;
}

export interface IOffer extends IEventData {
  sdp: string;
}

export interface IAnswer extends IOffer {}

export interface ICandidate extends IEventData {
  candidate: string;
}

export interface ICallSignature extends IEventData {
  username: string;
}
