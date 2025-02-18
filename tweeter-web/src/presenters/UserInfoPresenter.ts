import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model/service/FollowService";
import { MessageView, Presenter } from "./Presenter";

export interface UserInfoView extends MessageView {
    setIsLoading: (isLoading: boolean) => void
    setIsFollower: (isFollower: boolean) => void
    setFolloweeCount: (count: number) => void
    setFollowerCount: (count: number) => void
}

export class UserInfoPresenter extends Presenter<UserInfoView> {
    private followService: FollowService;

    public constructor(view: UserInfoView){
        super(view);
        this.followService = new FollowService;
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
              await this.followService.getIsFollowerStatus(authToken!, currentUser!, displayedUser!)
            );
          }
        }, "determine follower status");
      };

    public async setNumbFollowees(
        authToken: AuthToken,
        displayedUser: User
      ) {
        this.doFailureReportingOperation(async () => {
          this.view.setFolloweeCount(await this.followService.getFolloweeCount(authToken, displayedUser));
        }, "get followees count");
      };

    public async setNumbFollowers(
        authToken: AuthToken,
        displayedUser: User
      ) {
        this.doFailureReportingOperation(async () => {
          this.view.setFollowerCount(await this.followService.getFollowerCount(authToken, displayedUser));
        }, "get followers count");
      };

      public async followDisplayedUser( displayedUser: User, authToken: AuthToken,
        event: React.MouseEvent
      ): Promise<void> {
        event.preventDefault();
    
        this.doFailureReportingOperation(async () => {
          this.view.setIsLoading(true);
          this.view.displayInfoMessage(`Following ${displayedUser!.name}...`, 0);
    
          const [followerCount, followeeCount] = await this.followService.follow(
            authToken!,
            displayedUser!
          );
    
          this.view.setIsFollower(true);
          this.view.setFollowerCount(followerCount);
          this.view.setFolloweeCount(followeeCount);
        }, "follow user");
        this.view.clearLastInfoMessage();
        this.view.setIsLoading(false);
      };

      public async unfollowDisplayedUser( displayedUser: User, authToken: AuthToken,
        event: React.MouseEvent
      ): Promise<void> {
        event.preventDefault();
    
        this.doFailureReportingOperation(async () => {
          this.view.setIsLoading(true);
          this.view.displayInfoMessage(`Unfollowing ${displayedUser!.name}...`, 0);
    
          const [followerCount, followeeCount] = await this.followService.unfollow(
            authToken!,
            displayedUser!
          );
    
          this.view.setIsFollower(false);
          this.view.setFollowerCount(followerCount);
          this.view.setFolloweeCount(followeeCount);
        }, "unfollow user");
        this.view.clearLastInfoMessage();
          this.view.setIsLoading(false);
      };
}