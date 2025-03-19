import { TweeterRequest } from "./TweeterRequest";

export interface ItemRequest<D> extends TweeterRequest {
  readonly token: string;
  readonly item: D;
}
