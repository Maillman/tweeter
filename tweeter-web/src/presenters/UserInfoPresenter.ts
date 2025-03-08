import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model/service/FollowService";
import { MessageView, Presenter } from "./Presenter";

export interface UserInfoView extends MessageView {
  setIsLoading: (isLoading: boolean) => void;
  setIsFollower: (isFollower: boolean) => void;
  setFolloweeCount: (count: number) => void;
  setFollowerCount: (count: number) => void;
}

export class UserInfoPresenter extends Presenter<UserInfoView> {
  private followService: FollowService;

  public constructor(view: UserInfoView) {
    super(view);
    this.followService = new FollowService();
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    this.doFailureReportingOperation(async () => {
      if (currentUser === displayedUser) {
        this.view.setIsFollower(false);
      } else {
        this.view.setIsFollower(
          await this.followService.getIsFollowerStatus(
            authToken!,
            currentUser!,
            displayedUser!
          )
        );
      }
    }, "determine follower status");
  }

  public async setNumbFollowees(authToken: AuthToken, displayedUser: User) {
    this.doFailureReportingOperation(async () => {
      this.view.setFolloweeCount(
        await this.followService.getFolloweeCount(authToken, displayedUser)
      );
    }, "get followees count");
  }

  public async setNumbFollowers(authToken: AuthToken, displayedUser: User) {
    this.doFailureReportingOperation(async () => {
      this.view.setFollowerCount(
        await this.followService.getFollowerCount(authToken, displayedUser)
      );
    }, "get followers count");
  }

  public async followDisplayedUser(
    displayedUser: User,
    authToken: AuthToken,
    event: React.MouseEvent
  ): Promise<void> {
    this.setFollowDisplayedUser(
      async () => this.followService.follow(authToken!, displayedUser!),
      authToken,
      displayedUser,
      event,
      `Following ${displayedUser!.name}...`,
      "follow user",
      true
    );
  }

  public async unfollowDisplayedUser(
    displayedUser: User,
    authToken: AuthToken,
    event: React.MouseEvent
  ): Promise<void> {
    this.setFollowDisplayedUser(
      async () => this.followService.unfollow(authToken!, displayedUser!),
      authToken,
      displayedUser,
      event,
      `Unfollowing ${displayedUser!.name}...`,
      "unfollow user",
      false
    );
  }

  private async setFollowDisplayedUser(
    operation: (authToken: AuthToken, user: User) => Promise<[number, number]>,
    authToken: AuthToken,
    displayedUser: User,
    event: React.MouseEvent,
    infoMessage: string,
    operationDescription: string,
    isFollower: boolean
  ): Promise<void> {
    event.preventDefault();

    this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      this.view.displayInfoMessage(infoMessage, 0);

      const [followerCount, followeeCount] = await operation(
        authToken,
        displayedUser
      );

      this.view.setIsFollower(isFollower);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
      this.view.clearLastInfoMessage();
      this.view.setIsLoading(false);
    }, operationDescription);
  }
}
