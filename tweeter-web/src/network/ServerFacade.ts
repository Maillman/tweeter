import {
  AuthToken,
  LoginRequest,
  LoginResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  TweeterResponse,
  User,
  UserDto,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

export class ServerFacade {
  private SERVER_URL =
    "https://quqt6shts7.execute-api.us-east-2.amazonaws.com/dev";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  public async getMoreFollowees(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/followee/list");

    // Convert the UserDto array returned by ClientCommunicator to a User array
    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto) => User.fromDto(dto) as User)
        : null;

    // Handle errors
    return this.handleResponse(response, () => {
      if (items == null) {
        throw new Error(`No followees found`);
      } else {
        return [items, response.hasMore];
      }
    });
  }

  public async login(request: LoginRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      LoginRequest,
      LoginResponse
    >(request, "/authenticate/login");

    // Convert the UserDto and the AuthTokenDto returned by ClientCommunicator to a User and AuthToken
    const user: User | null =
      response.success && response.user ? User.fromDto(response.user) : null;
    const authToken: AuthToken | null =
      response.success && response.authToken
        ? AuthToken.fromDto(response.authToken)
        : null;

    // Handle Errors
    return this.handleResponse(response, () => {
      if (user && authToken) {
        return [user, authToken];
      } else {
        throw new Error(`No user or authtoken returned`);
      }
    });
  }

  private handleResponse<R extends TweeterResponse>(
    response: R,
    onSuccess: () => void
  ): any {
    if (response.success) {
      return onSuccess();
    } else {
      console.log(response);
      throw new Error(
        response.message
          ? response.message
          : "Error: unable to parse message of response"
      );
    }
  }
}
