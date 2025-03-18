import { FollowResponse, UpdateItemRequest, UserDto } from "tweeter-shared";
import { FollowHandler } from "./FollowHandler";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (
  request: UpdateItemRequest<UserDto>
): Promise<FollowResponse> => {
  return FollowHandler(
    (token, user) => new FollowService().follow(token, user),
    request
  );
};
