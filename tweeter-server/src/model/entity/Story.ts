export class Story {
  private _alias: string;
  private _timestamp: number;
  private _post: string;

  constructor(alias: string, timestamp: number, post: string) {
    this._alias = alias;
    this._timestamp = timestamp;
    this._post = post;
  }

  public get alias(): string {
    return this._alias;
  }

  public get timestamp(): number {
    return this._timestamp;
  }

  public get post(): string {
    return this._post;
  }
}
