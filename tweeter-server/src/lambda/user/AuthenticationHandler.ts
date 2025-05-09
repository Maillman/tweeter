import {
  AuthenticationRequest,
  AuthenticationResponse,
  RegisterRequest,
} from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDBDAOFactory } from "../../model/dao/DynamoDBDAOs/DynamoDBDAOFactory";

export const AuthenticationHandler = async <R extends AuthenticationRequest>(
  request: R
): Promise<AuthenticationResponse> => {
  const userService = new UserService(new DynamoDBDAOFactory());
  const [user, authToken] = await (isRegisterRequest(request)
    ? userService.register(
        request.firstName,
        request.lastName,
        request.alias,
        request.password,
        request.imageStringBase64,
        request.imageFileExtension
      )
    : userService.login(request.alias, request.password));
  return {
    success: true,
    message: null,
    user: user,
    authToken: authToken,
  };
};

function isRegisterRequest(
  request: AuthenticationRequest
): request is RegisterRequest {
  return "firstName" in request && "lastName" in request;
}
