import { TweeterResponse } from "./TweeterResponse";

export interface ItemResponse<D> extends TweeterResponse {
  readonly item: D;
}
