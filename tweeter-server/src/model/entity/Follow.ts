export class Follow {
  private _follower: string;
  private _followerHandle: string;
  private _followee: string;
  private _followeeHandle: string;

  constructor(
    follower: string,
    followerHandle: string,
    followee: string,
    followeeHandle: string
  ) {
    this._follower = follower;
    this._followerHandle = followerHandle;
    this._followee = followee;
    this._followeeHandle = followeeHandle;
  }

  public get follower(): string {
    return this._follower;
  }

  public get followee(): string {
    return this._followee;
  }

  public get followerHandle(): string {
    return this._followerHandle;
  }

  public get followeeHandle(): string {
    return this._followeeHandle;
  }
}
