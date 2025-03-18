import { TweeterRequest } from "./TweeterRequest";

export interface UpdateItemRequest<D> extends TweeterRequest {
  readonly token: string;
  readonly item: D;
}
