import { FollowCountResponse, ItemRequest, UserDto } from "tweeter-shared";
import { FollowCountHandler } from "./FollowCountHandler";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (
  request: ItemRequest<UserDto>
): Promise<FollowCountResponse> => {
  return FollowCountHandler(
    (token, user) => new FollowService().getFolloweeCount(token, user),
    request
  );
};
