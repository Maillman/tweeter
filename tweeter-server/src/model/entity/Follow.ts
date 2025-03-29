export class Follow {
  private _followerHandle: string;
  private _followeeHandle: string;

  constructor(followerHandle: string, followeeHandle: string) {
    this._followerHandle = followerHandle;
    this._followeeHandle = followeeHandle;
  }

  public get followerHandle(): string {
    return this._followerHandle;
  }

  public get followeeHandle(): string {
    return this._followeeHandle;
  }
}
