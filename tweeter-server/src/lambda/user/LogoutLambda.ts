import { LogoutRequest, TweeterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: LogoutRequest
): Promise<TweeterResponse> => {
  await new UserService().logout(request.token);
  return {
    success: true,
    message: null,
  };
};
