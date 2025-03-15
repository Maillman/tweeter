import { TweeterResponse } from "./TweeterResponse";

export interface PagedUserItemResponse<D> extends TweeterResponse {
  readonly items: D[] | null;
  readonly hasMore: boolean;
}
