import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model/service/StatusService";
import { MessageView, Presenter } from "./Presenter";


export interface PostStatusView extends MessageView {
    setIsLoading: (isLoading: boolean) => void
    setPost: (post: string) => void
}

export class PostStatusPresenter extends Presenter<PostStatusView> {
    private statusService: StatusService;

    public constructor(view: PostStatusView){
        super(view);
        this.statusService = new StatusService;
    }

    public checkButtonStatus(post: string, currentUser: User | null, authToken: AuthToken | null): boolean {
        return !post.trim() || !authToken || !currentUser;
      };

    public async submitPost(event: React.MouseEvent, post: string, currentUser: User | null, authToken: AuthToken | null) {
        event.preventDefault();

        this.doFailureReportingOperation(async () => {
          this.view.setIsLoading(true);
          this.view.displayInfoMessage("Posting status...", 0);
    
          const status = new Status(post, currentUser!, Date.now());
          console.log("testing");
          await this.statusService.postStatus(authToken!, status);
    
          this.view.setPost("");
          this.view.displayInfoMessage("Status posted!", 2000);
          this.view.clearLastInfoMessage();
          this.view.setIsLoading(false);
        }, "post the status");
      };
}