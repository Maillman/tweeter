import { FollowResponse, ItemRequest, UserDto } from "tweeter-shared";
import { FollowHandler } from "./FollowHandler";
import { FollowService } from "../../model/service/FollowService";
import { DynamoDBDAOFactory } from "../../model/dao/DynamoDBDAOs/DynamoDBDAOFactory";

export const handler = async (
  request: ItemRequest<UserDto>
): Promise<FollowResponse> => {
  return FollowHandler(
    (token, user) =>
      new FollowService(new DynamoDBDAOFactory()).follow(token, user),
    request
  );
};
