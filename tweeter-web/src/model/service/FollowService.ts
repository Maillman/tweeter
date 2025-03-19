import {
  AuthToken,
  User,
  FakeData,
  PagedUserItemRequest,
} from "tweeter-shared";
import { ServerFacade } from "../../network/ServerFacade";

export class FollowService {
  private serverFacade = new ServerFacade();

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    return this.serverFacade.getMoreFollowers({
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    });
  }

  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    return this.serverFacade.getMoreFollowees({
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    });
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    return this.serverFacade.getIsFollower({
      token: authToken.token,
      user: user.dto,
      selectedUser: selectedUser.dto,
    });
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    return this.serverFacade.getFolloweeCount({
      token: authToken.token,
      item: user.dto,
    });
  }

  public async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    return this.serverFacade.getFollowerCount({
      token: authToken.token,
      item: user.dto,
    });
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.serverFacade.follow({
      token: authToken.token,
      item: userToFollow.dto,
    });
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.serverFacade.follow({
      token: authToken.token,
      item: userToUnfollow.dto,
    });
  }
}
