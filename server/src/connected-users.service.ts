import { Injectable } from '@nestjs/common';
import { IUser } from './interfaces';

@Injectable()
export class ConnectedUsersService {
  private _users: IUser[] = [];

  constructor() {}

  push(user: IUser): void {
    this._users.push(user);
  }

  remove(uid: string): void {
    this._users = this._users.filter((u) => u.uid !== uid);
  }

  getAll(): IUser[] {
    return this._users;
  }

  getById(uid: string): IUser {
    return this._users.find((u) => u.uid === uid);
  }
}
