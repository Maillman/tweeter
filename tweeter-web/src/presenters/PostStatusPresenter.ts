import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model/service/StatusService";


export interface PostStatusView {
    setIsLoading: (isLoading: boolean) => void
    displayInfoMessage: (message: string, duration: number, bootstrapClasses?: string) => void
    clearLastInfoMessage: () => void
    setPost: (post: string) => void
    displayErrorMessage: (message: string, bootstrapClasses?: string) => void
}

export class PostStatusPresenter {
    private statusService: StatusService;
    private view: PostStatusView;

    public constructor(view: PostStatusView){
        this.view = view;
        this.statusService = new StatusService;
    }

    public checkButtonStatus(post: string, currentUser: User | null, authToken: AuthToken | null): boolean {
        return !post.trim() || !authToken || !currentUser;
      };

    public async submitPost(event: React.MouseEvent, post: string, currentUser: User | null, authToken: AuthToken | null) {
        event.preventDefault();
    
        try {
          this.view.setIsLoading(true);
          this.view.displayInfoMessage("Posting status...", 0);
    
          const status = new Status(post, currentUser!, Date.now());
    
          await this.statusService.postStatus(authToken!, status);
    
          this.view.setPost("");
          this.view.displayInfoMessage("Status posted!", 2000);
        } catch (error) {
          this.view.displayErrorMessage(
            `Failed to post the status because of exception: ${error}`
          );
        } finally {
          this.view.clearLastInfoMessage();
          this.view.setIsLoading(false);
        }
      };
}