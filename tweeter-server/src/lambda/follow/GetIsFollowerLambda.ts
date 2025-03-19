import { IsFollowerRequest, IsFollowerResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (
  request: IsFollowerRequest
): Promise<IsFollowerResponse> => {
  const isFollower = await new FollowService().getIsFollowerStatus(
    request.token,
    request.user,
    request.selectedUser
  );
  return {
    success: true,
    message: null,
    isFollower: isFollower,
  };
};
