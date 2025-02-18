import { AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { Presenter, MessageView } from "./Presenter";

export interface AppNavbarView extends MessageView {
    clearUserInfo: () => void
}

export class AppNavbarPresenter extends Presenter<AppNavbarView> {
    private userService: UserService;

    public constructor(view: AppNavbarView){
        super(view);
        this.userService = new UserService;
    }

    public async logOut(authToken: AuthToken | null) {
        this.view.displayInfoMessage("Logging Out...", 0);
    
        this.doFailureReportingOperation(async () => {
          await this.userService.logout(authToken!);
    
          this.view.clearLastInfoMessage();
          this.view.clearUserInfo();
        }, "log user out");
    };
}