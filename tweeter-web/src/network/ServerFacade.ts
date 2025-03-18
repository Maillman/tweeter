import {
  AuthToken,
  AuthenticationRequest,
  AuthenticationResponse,
  FollowResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  RegisterRequest,
  Status,
  StatusDto,
  TweeterResponse,
  UpdateItemRequest,
  User,
  UserDto,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";
import { Transferable } from "tweeter-shared/dist/model/domain/Transferable";

export class ServerFacade {
  private SERVER_URL =
    "https://quqt6shts7.execute-api.us-east-2.amazonaws.com/dev";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  public async getMoreFollowees(
    request: PagedUserItemRequest<UserDto>
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest<UserDto>,
      PagedUserItemResponse<UserDto>
    >(request, "/followee/list");

    return this.convertDtoAndReturn<UserDto, User>(
      response,
      "followees",
      (dto) => User.fromDto(dto)
    );
  }

  public async getMoreFollowers(
    request: PagedUserItemRequest<UserDto>
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest<UserDto>,
      PagedUserItemResponse<UserDto>
    >(request, "/follower/list");

    return this.convertDtoAndReturn<UserDto, User>(
      response,
      "followers",
      (dto) => User.fromDto(dto)
    );
  }

  public async getMoreFeedItems(
    request: PagedUserItemRequest<StatusDto>
  ): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest<StatusDto>,
      PagedUserItemResponse<StatusDto>
    >(request, "/feed/list");

    return this.convertDtoAndReturn<StatusDto, Status>(
      response,
      "feed items",
      (dto) => Status.fromDto(dto)
    );
  }

  public async getMoreStoryItems(
    request: PagedUserItemRequest<StatusDto>
  ): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest<StatusDto>,
      PagedUserItemResponse<StatusDto>
    >(request, "/story/list");

    return this.convertDtoAndReturn<StatusDto, Status>(
      response,
      "story items",
      (dto) => Status.fromDto(dto)
    );
  }

  private convertDtoAndReturn<D, T extends Transferable<D, T>>(
    response: PagedUserItemResponse<D>,
    itemDescription: string,
    fromDto: (dto: D | null) => T | null
  ) {
    // Convert the Dto array returned by ClientCommunicator to an Item array
    const items: T[] | null =
      response.success && response.items
        ? response.items.map((dto) => fromDto(dto) as T)
        : null;

    // Handle errors
    return this.handleResponse(response, () => {
      if (items == null) {
        throw new Error(`No ${itemDescription} found`);
      } else {
        return [items, response.hasMore];
      }
    });
  }

  public async postStatus(
    request: UpdateItemRequest<StatusDto>
  ): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      UpdateItemRequest<StatusDto>,
      TweeterResponse
    >(request, "/status/create");
    return this.handleResponse(response);
  }

  public async follow(
    request: UpdateItemRequest<UserDto>
  ): Promise<[followerCount: number, followeeCount: number]> {
    const response = await this.clientCommunicator.doPost<
      UpdateItemRequest<UserDto>,
      FollowResponse
    >(request, "/user/follow");

    return this.handleFollowResponse(response);
  }

  public async unfollow(
    request: UpdateItemRequest<UserDto>
  ): Promise<[followerCount: number, followeeCount: number]> {
    const response = await this.clientCommunicator.doPost<
      UpdateItemRequest<UserDto>,
      FollowResponse
    >(request, "/user/unfollow");

    return this.handleFollowResponse(response);
  }

  private handleFollowResponse(
    response: FollowResponse
  ): [followerCount: number, followeeCount: number] {
    return this.handleResponse(response, () => {
      if (response.followerCount && response.followeeCount) {
        return [response.followerCount, response.followeeCount];
      } else {
        throw new Error(`Unable to retrieve follower or followee count`);
      }
    });
  }

  public async login(
    request: AuthenticationRequest
  ): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      AuthenticationRequest,
      AuthenticationResponse
    >(request, "/authenticate/login");

    return this.handleAuthResponse(response);
  }

  public async register(request: RegisterRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      RegisterRequest,
      AuthenticationResponse
    >(request, "/authenticate/register");

    return this.handleAuthResponse(response);
  }

  private handleAuthResponse(response: AuthenticationResponse) {
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
    onSuccess: () => void = () => {
      return;
    }
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
