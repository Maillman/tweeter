import { TweeterRequest } from "./TweeterRequest";

export interface PagedUserItemRequest<D> extends TweeterRequest {
  readonly token: string;
  readonly userAlias: string;
  readonly pageSize: number;
  readonly lastItem: D | null;
}
