import { AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";

export interface AppNavbarView {
    displayInfoMessage: (message: string, duration: number, bootstrapClasses?: string) => void
    clearLastInfoMessage: () => void
    clearUserInfo: () => void
    displayErrorMessage: (message: string, bootstrapClasses?: string) => void
}

export class AppNavbarPresenter {
    private userService: UserService;
    private view: AppNavbarView;

    public constructor(view: AppNavbarView){
        this.view = view;
        this.userService = new UserService;
    }

    public async logOut(authToken: AuthToken | null) {
        this.view.displayInfoMessage("Logging Out...", 0);
    
        try {
          await this.userService.logout(authToken!);
    
          this.view.clearLastInfoMessage();
          this.view.clearUserInfo();
        } catch (error) {
          this.view.displayErrorMessage(
            `Failed to log user out because of exception: ${error}`
          );
        }
    };
}