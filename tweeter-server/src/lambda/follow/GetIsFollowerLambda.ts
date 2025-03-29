import { IsFollowerRequest, IsFollowerResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoDBDAOFactory } from "../../model/dao/DynamoDBDAOs/DynamoDBDAOFactory";

export const handler = async (
  request: IsFollowerRequest
): Promise<IsFollowerResponse> => {
  const isFollower = await new FollowService(
    new DynamoDBDAOFactory()
  ).getIsFollowerStatus(request.token, request.user, request.selectedUser);
  return {
    success: true,
    message: null,
    isFollower: isFollower,
  };
};
