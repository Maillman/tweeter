import { Status, FakeData, StatusDto } from "tweeter-shared";
import { FakeDataService } from "./FakeDataService";
import { DAOFactory } from "../dao/DAOFactory";
import { FollowsDAO } from "../dao/FollowsDAO";
import { SessionsDAO } from "../dao/SessionsDAO";
import { UsersDAO } from "../dao/UsersDAO";
import { StoriesDAO } from "../dao/StoriesDAO";
import { VerifyTokenService } from "./VerifyTokenService";
import { UserService } from "./UserService";

export class StatusService {
  private daoFactory: DAOFactory;
  private followsDAO: FollowsDAO;
  private usersDAO: UsersDAO;
  private sessionsDAO: SessionsDAO;
  private storiesDAO: StoriesDAO;

  constructor(daoFactory: DAOFactory) {
    this.daoFactory = daoFactory;
    this.followsDAO = daoFactory.getFollowsDAO();
    this.usersDAO = daoFactory.getUsersDAO();
    this.sessionsDAO = daoFactory.getSessionsDAO();
    this.storiesDAO = daoFactory.getStoriesDAO();
  }

  public async loadMoreFeedItems(
    authToken: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    // TODO: Replace with the result of calling server
    return FakeDataService.getFakeDataStatuses(pageSize, lastItem);
  }

  public async loadMoreStoryItems(
    authToken: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    //Verify the token and update!
    await VerifyTokenService.verifyToken(this.sessionsDAO, authToken);

    //Get page of Stories
    const stories = await this.storiesDAO.getPageOfStories(
      userAlias,
      pageSize,
      lastItem ? lastItem.timestamp : undefined
    );

    //Convert Stories to StatusDtos
    const storyItems = await Promise.all(
      stories.values.map(async (Story) => {
        const [user] = await UserService.getUserDetails(
          this.usersDAO,
          Story.alias
        );
        return new Status(Story.post, user, Story.timestamp).dto;
      })
    );

    return [storyItems, stories.hasMorePages];
  }

  public async postStatus(
    authToken: string,
    newStatus: StatusDto
  ): Promise<void> {
    //Verify the token and update!
    await VerifyTokenService.verifyToken(this.sessionsDAO, authToken);

    //Post status to story
    await this.storiesDAO.putStory(newStatus);

    //Post status to feeds of all users following user
    //TODO: Add this functionality!
  }
}
