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
import { Story } from "../entity/Story";

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
    //Verify the token and update!
    await VerifyTokenService.verifyToken(this.sessionsDAO, token);

    return await FollowService.loadMoreFollows(
      this.usersDAO,
      (fh, lfh, ps) => this.followsDAO.getPageOfFollowers(fh, lfh, ps),
      false,
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
    //Verify the token and update!
    await VerifyTokenService.verifyToken(this.sessionsDAO, token);

    return await FollowService.loadMoreFollows(
      this.usersDAO,
      (fh, lfh, ps) => this.followsDAO.getPageOfFollowees(fh, lfh, ps),
      true,
      userAlias,
      pageSize,
      lastItem
    );
  }

  public static async loadMoreFollows(
    usersDAO: UsersDAO,
    pageOperation: (
      followerHandle: string,
      lastFolloweeHandle: string | undefined,
      pageSize: number
    ) => Promise<DataPage<Follow>>,
    getFollowees: boolean,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
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
          usersDAO,
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
    //Verify the token and update!
    await VerifyTokenService.verifyToken(this.sessionsDAO, token);

    //Get follow relationship
    const followRelationship = await this.followsDAO.getFollow(
      new Follow(user.alias, selectedUser.alias)
    );

    return followRelationship !== undefined;
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
      throw new Error("[Server Error] Unable to retrieve your information");
    }

    //Confirm relationship exists if to unfollow
    if (!isToFollow) {
      const [user] = await UserService.getUserDetails(this.usersDAO, userAlias);
      if (
        !(await this.getIsFollowerStatus(token, user.dto, userToChangeFollow))
      ) {
        throw new Error("[Bad Request] You aren't following this user");
      }
    }

    //Update the follow relationship
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
        new Follow(userAlias, userToChangeFollow.alias)
      );
    } else {
      await this.followsDAO.deleteFollow(
        new Follow(userAlias, userToChangeFollow.alias)
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
  public async getNumberOfFollowers(
    userAlias: string,
    numberOfFollowers: number,
    lastFollower: string | null
  ): Promise<[string[], boolean]> {
    console.log(userAlias, numberOfFollowers, lastFollower);
    //Post status to feeds of all users following user
    let allFollowers: string[] = [];
    let hasMore = true;
    do {
      const getPageOfFollowers = await this.followsDAO.getPageOfFollowers(
        userAlias,
        lastFollower === null ? undefined : lastFollower,
        25
      );
      const userAliases: string[] = getPageOfFollowers.values.map(
        (follow) => follow.followerHandle
      );
      const hasMoreFollowers = getPageOfFollowers.hasMorePages;
      console.log("In getNumberOfFollowers", userAlias, hasMoreFollowers);
      allFollowers = [...allFollowers, ...userAliases];
      const getLastFollower = allFollowers.at(-1);
      console.log(
        userAlias,
        hasMoreFollowers,
        "the last follower:",
        getLastFollower
      );
      lastFollower = getLastFollower === undefined ? null : getLastFollower;
      hasMore = hasMoreFollowers;
    } while (hasMore && allFollowers.length < numberOfFollowers);
    return [allFollowers, hasMore];
  }
}
