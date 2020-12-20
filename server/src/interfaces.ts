export interface IUser {
  name: string;
  uid: string;
  socketId: string;
}

export interface IOffer {
  name: string;
  sdp: string;
  target: string;
}

export interface ITryCallSignature {
  username: string;
  participantUid: string;
}
