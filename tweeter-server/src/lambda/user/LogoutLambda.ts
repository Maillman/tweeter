import { LogoutRequest, TweeterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDBDAOFactory } from "../../model/dao/DynamoDBDAOs/DynamoDBDAOFactory";

export const handler = async (
  request: LogoutRequest
): Promise<TweeterResponse> => {
  await new UserService(new DynamoDBDAOFactory()).logout(request.token);
  return {
    success: true,
    message: null,
  };
};
