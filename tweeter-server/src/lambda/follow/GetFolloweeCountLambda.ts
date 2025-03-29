import { FollowCountResponse, ItemRequest, UserDto } from "tweeter-shared";
import { FollowCountHandler } from "./FollowCountHandler";
import { FollowService } from "../../model/service/FollowService";
import { DynamoDBDAOFactory } from "../../model/dao/DynamoDBDAOs/DynamoDBDAOFactory";

export const handler = async (
  request: ItemRequest<UserDto>
): Promise<FollowCountResponse> => {
  return FollowCountHandler(
    (token, user) =>
      new FollowService(new DynamoDBDAOFactory()).getFolloweeCount(token, user),
    request
  );
};
