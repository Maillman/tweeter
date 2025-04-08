import { Status, FakeData, StatusDto, UserDto } from "tweeter-shared";
import { FakeDataService } from "./FakeDataService";
import { DAOFactory } from "../dao/DAOFactory";
import { FollowsDAO } from "../dao/FollowsDAO";
import { SessionsDAO } from "../dao/SessionsDAO";
import { UsersDAO } from "../dao/UsersDAO";
import { StoriesDAO } from "../dao/StoriesDAO";
import { VerifyTokenService } from "./VerifyTokenService";
import { UserService } from "./UserService";
import { FollowService } from "./FollowService";
import { FeedsDAO } from "../dao/FeedsDAO";
import { DataPage } from "../entity/DataPage";
import { Story } from "../entity/Story";

export class StatusService {
  private daoFactory: DAOFactory;
  private followsDAO: FollowsDAO;
  private usersDAO: UsersDAO;
  private sessionsDAO: SessionsDAO;
  private storiesDAO: StoriesDAO;
  private feedsDAO: FeedsDAO;

  constructor(daoFactory: DAOFactory) {
    this.daoFactory = daoFactory;
    this.followsDAO = daoFactory.getFollowsDAO();
    this.usersDAO = daoFactory.getUsersDAO();
    this.sessionsDAO = daoFactory.getSessionsDAO();
    this.storiesDAO = daoFactory.getStoriesDAO();
    this.feedsDAO = daoFactory.getFeedsDAO();
  }

  public async loadMoreFeedItems(
    authToken: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    return await this.loadMoreStatusItems(
      (fh, ps, lt) => this.feedsDAO.getPageOfFeed(fh, ps, lt),
      authToken,
      userAlias,
      pageSize,
      lastItem
    );
  }

  public async loadMoreStoryItems(
    authToken: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    return await this.loadMoreStatusItems(
      (fh, ps, lt) => this.storiesDAO.getPageOfStories(fh, ps, lt),
      authToken,
      userAlias,
      pageSize,
      lastItem
    );
  }

  private async loadMoreStatusItems(
    pageOperation: (
      followerHandle: string,
      pageSize: number,
      lastTimestamp: number | undefined
    ) => Promise<DataPage<Story>>,
    authToken: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    //Verify the token and update!
    await VerifyTokenService.verifyToken(this.sessionsDAO, authToken);

    //Get page of Stories
    const statuses = await pageOperation(
      userAlias,
      pageSize,
      lastItem ? lastItem.timestamp : undefined
    );

    //Convert Stories to StatusDtos
    const statusItems = await Promise.all(
      statuses.values.map(async (Story) => {
        const [user] = await UserService.getUserDetails(
          this.usersDAO,
          Story.alias
        );
        return new Status(Story.post, user, Story.timestamp).dto;
      })
    );

    return [statusItems, statuses.hasMorePages];
  }

  public async postStatus(
    authToken: string,
    newStatus: StatusDto
  ): Promise<void> {
    //Verify the token and update!
    await VerifyTokenService.verifyToken(this.sessionsDAO, authToken);

    //Get the user alias
    const userAlias = await this.sessionsDAO.getUserHandle(authToken);
    if (userAlias === undefined) {
      throw new Error(
        "[Server Error] Something went wrong retrieving your information"
      );
    }
    if (userAlias !== newStatus.user.alias) {
      throw new Error("[Bad Request] You cannot post as another user");
    }

    //Post status to story
    await this.storiesDAO.putStory(newStatus);

    //Post status to feeds of all users following user -> FollowFetcherLambda
    //FIXME: remove this once ready to move onto the   -> FollowFetcherLambda
    // let allFollowers: UserDto[] = [];
    // let lastFollower: UserDto | null = null;
    // let hasMore = true;
    // do {
    //   const [loadMoreFollowers, hasMoreFollowers] =
    //     await FollowService.loadMoreFollows(
    //       this.usersDAO,
    //       (fh, lfh, ps) => this.followsDAO.getPageOfFollowers(fh, lfh, ps),
    //       false,
    //       userAlias,
    //       25,
    //       lastFollower
    //     );
    //   console.log(loadMoreFollowers, hasMoreFollowers);
    //   allFollowers = [...allFollowers, ...loadMoreFollowers];
    //   const getLastFollower = allFollowers.at(-1);
    //   lastFollower = getLastFollower === undefined ? null : getLastFollower;
    //   hasMore = hasMoreFollowers;
    // } while (hasMore);
    // //Send the post to the feed of all the followers -> JobHandlerLambda
    // console.log(allFollowers);
    // for (let follower of allFollowers) {
    //   await this.feedsDAO.putFeed(follower.alias, newStatus);
    // }
  }
}
