import { FakeData, User, UserDto } from "tweeter-shared";
import { FakeDataService } from "./FakeDataService";
import { DAOFactory } from "../dao/DAOFactory";
import { FollowsDAO } from "../dao/FollowsDAO";
import { SessionsDAO } from "../dao/SessionsDAO";
import { VerifyTokenService } from "./VerifyTokenService";
import { Follow } from "../entity/Follow";
import { UserService } from "./UserService";
import { DataPage } from "../entity/DataPage";

export class FollowService {
  private daoFactory: DAOFactory;
  private followsDAO: FollowsDAO;
  private sessionsDAO: SessionsDAO;

  constructor(daoFactory: DAOFactory) {
    this.daoFactory = daoFactory;
    this.followsDAO = daoFactory.getFollowsDAO();
    this.sessionsDAO = daoFactory.getSessionsDAO();
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    return await this.loadMoreFollows(
      (fh, lfh, ps) => this.followsDAO.getPageOfFollowers(fh, lfh, ps),
      false,
      token,
      userAlias,
      pageSize,
      lastItem
    );
  }

  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    return await this.loadMoreFollows(
      (fh, lfh, ps) => this.followsDAO.getPageOfFollowees(fh, lfh, ps),
      true,
      token,
      userAlias,
      pageSize,
      lastItem
    );
  }

  public async loadMoreFollows(
    pageOperation: (
      followerHandle: string,
      lastFolloweeHandle: string | undefined,
      pageSize: number
    ) => Promise<DataPage<Follow>>,
    getFollowees: boolean,
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    //Verify the token and update!
    await VerifyTokenService.verifyToken(this.sessionsDAO, token);

    const pageOfFollows = await pageOperation(
      userAlias,
      lastItem ? lastItem.alias : undefined,
      pageSize
    );
    console.log(pageOfFollows);

    //Map follows to userDtos
    const userService = new UserService(this.daoFactory);
    const userAndNullDtos: (UserDto | null)[] = await Promise.all(
      pageOfFollows.values.map(
        async (Follow) =>
          await userService.getUser(
            token,
            getFollowees ? Follow.followeeHandle : Follow.followerHandle
          )
      )
    );
    const userDtos: UserDto[] = userAndNullDtos.filter(Boolean) as UserDto[];

    return [userDtos, pageOfFollows.hasMorePages];
  }

  public async getIsFollowerStatus(
    token: string,
    user: UserDto,
    selectedUser: UserDto
  ): Promise<boolean> {
    // TODO: Replace with the result of calling server
    return FakeData.instance.isFollower();
  }

  public async getFolloweeCount(token: string, user: UserDto): Promise<number> {
    // TODO: Replace with the result of calling server
    return FakeData.instance.getFolloweeCount(user.alias);
  }

  public async getFollowerCount(token: string, user: UserDto): Promise<number> {
    // TODO: Replace with the result of calling server
    return FakeData.instance.getFollowerCount(user.alias);
  }

  public async follow(
    token: string,
    userToFollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    // Pause so we can see the follow message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server

    const followerCount = await this.getFollowerCount(token, userToFollow);
    const followeeCount = await this.getFolloweeCount(token, userToFollow);

    return [followerCount, followeeCount];
  }

  public async unfollow(
    token: string,
    userToUnfollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    // Pause so we can see the unfollow message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server

    const followerCount = await this.getFollowerCount(token, userToUnfollow);
    const followeeCount = await this.getFolloweeCount(token, userToUnfollow);

    return [followerCount, followeeCount];
  }
}
