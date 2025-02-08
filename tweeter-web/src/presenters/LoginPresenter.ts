import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { useNavigate } from "react-router-dom";

export interface LoginView {
    originalUrl?: string;
    alias: string
    password: string
    rememberMe: boolean
    setIsLoading: (isLoading: boolean) => void
    updateUserInfo: (currentUser: User, displayedUser: User | null, authToken: AuthToken, remember: boolean) => void
    displayErrorMessage: (message: string) => void
}

export class LoginPresenter {
    private userService: UserService;
    private view: LoginView;

    private navigate = useNavigate();

    public constructor(view: LoginView){
        this.view = view;
        this.userService = new UserService;
    }

    public updateView(view: LoginView){
      this.view = view;
    }

    public checkSubmitButtonStatus(): boolean {
        return !this.view.alias || !this.view.password;
      };

    public loginOnEnter(event: React.KeyboardEvent<HTMLElement>) {
        if (event.key == "Enter" && !this.checkSubmitButtonStatus()) {
          this.doLogin();
        }
      };

    public async doLogin() {
        try {
          this.view.setIsLoading(true);
    
          const [user, authToken] = await this.userService.login(this.view.alias, this.view.password);
    
          this.view.updateUserInfo(user, user, authToken, this.view.rememberMe);
    
          if (!!this.view.originalUrl) {
            this.navigate(this.view.originalUrl);
          } else {
            this.navigate("/");
          }
        } catch (error) {
          this.view.displayErrorMessage(
            `Failed to log user in because of exception: ${error}`
          );
        } finally {
          this.view.setIsLoading(false);
        }
      };
}