import { FakeData, User, UserDto } from "tweeter-shared";
import { FakeDataService } from "./FakeDataService";
import { DAOFactory } from "../dao/DAOFactory";
import { FollowsDAO } from "../dao/FollowsDAO";
import { SessionsDAO } from "../dao/SessionsDAO";
import { VerifyTokenService } from "./VerifyTokenService";
import { Follow } from "../entity/Follow";
import { UserService } from "./UserService";
import { DataPage } from "../entity/DataPage";
import { UsersDAO } from "../dao/UsersDAO";

export class FollowService {
  private daoFactory: DAOFactory;
  private followsDAO: FollowsDAO;
  private usersDAO: UsersDAO;
  private sessionsDAO: SessionsDAO;

  constructor(daoFactory: DAOFactory) {
    this.daoFactory = daoFactory;
    this.followsDAO = daoFactory.getFollowsDAO();
    this.usersDAO = daoFactory.getUsersDAO();
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

  private async loadMoreFollows(
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
    //const userService = new UserService(this.daoFactory);
    const userDtos: UserDto[] = await Promise.all(
      pageOfFollows.values.map(async (Follow) => {
        const [user] = await UserService.getUserDetails(
          this.usersDAO,
          getFollowees ? Follow.followeeHandle : Follow.followerHandle
        );
        return user.dto;
      })
    );

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
    //Verify the token and update!
    await VerifyTokenService.verifyToken(this.sessionsDAO, token);

    const [, , , followeeCount] = await UserService.getUserDetails(
      this.usersDAO,
      user.alias
    );
    return followeeCount;
  }

  public async getFollowerCount(token: string, user: UserDto): Promise<number> {
    //Verify the token and update!
    await VerifyTokenService.verifyToken(this.sessionsDAO, token);

    const [, , followerCount] = await UserService.getUserDetails(
      this.usersDAO,
      user.alias
    );
    return followerCount;
  }

  public async follow(
    token: string,
    userToFollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    return await this.changeFollowRelationship(token, userToFollow, true);
  }

  public async unfollow(
    token: string,
    userToUnfollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    return await this.changeFollowRelationship(token, userToUnfollow, false);
  }

  private async changeFollowRelationship(
    token: string,
    userToChangeFollow: UserDto,
    isToFollow: boolean
  ): Promise<[followerCount: number, followeeCount: number]> {
    //Verify the token and update!
    await VerifyTokenService.verifyToken(this.sessionsDAO, token);

    //Get userAlias from token
    const userAlias: string | undefined = await this.sessionsDAO.getUserHandle(
      token
    );
    if (userAlias === undefined) {
      throw new Error("[Server Error] Unable to retrieve your alias");
    }

    //Updte the follow relationship
    await this.usersDAO.updateUserFollowRelationship(
      userAlias,
      0,
      isToFollow ? 1 : -1
    );
    await this.usersDAO.updateUserFollowRelationship(
      userToChangeFollow.alias,
      isToFollow ? 1 : -1,
      0
    );
    if (isToFollow) {
      await this.followsDAO.putFollow(
        new Follow(userToChangeFollow.alias, userAlias)
      );
    } else {
      await this.followsDAO.deleteFollow(
        new Follow(userToChangeFollow.alias, userAlias)
      );
    }

    const followerCount = await this.getFollowerCount(
      token,
      userToChangeFollow
    );
    const followeeCount = await this.getFolloweeCount(
      token,
      userToChangeFollow
    );

    return [followerCount, followeeCount];
  }
}
