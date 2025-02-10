import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { useNavigate } from "react-router-dom";

export interface RegisterView {
    firstName: string
    lastName: string
    alias: string
    password: string
    imageUrl: string
    imageBytes: Uint8Array
    imageFileExtension: string
    rememberMe: boolean
    setIsLoading: (isLoading: boolean) => void
    updateUserInfo: (currentUser: User, displayedUser: User | null, authToken: AuthToken, remember: boolean) => void
    displayErrorMessage: (message: string) => void
}

export class RegisterPresenter {
    private userService: UserService;
    private view: RegisterView;

    private navigate = useNavigate();

    public updateView(view: RegisterView){
        this.view = view;
    }

    public constructor(view: RegisterView){
        this.view = view;
        this.userService = new UserService;
    }

    public checkSubmitButtonStatus(): boolean {
        return (
          !this.view.firstName ||
          !this.view.lastName ||
          !this.view.alias ||
          !this.view.password ||
          !this.view.imageUrl ||
          !this.view.imageFileExtension
        );
      };
    
      public registerOnEnter(event: React.KeyboardEvent<HTMLElement>) {
        if (event.key == "Enter" && !this.checkSubmitButtonStatus()) {
          this.doRegister();
        }
      };

    public async doRegister() {
        try {
          this.view.setIsLoading(true);
    
          const [user, authToken] = await this.userService.register(
            this.view.firstName,
            this.view.lastName,
            this.view.alias,
            this.view.password,
            this.view.imageBytes,
            this.view.imageFileExtension
          );
    
          this.view.updateUserInfo(user, user, authToken, this.view.rememberMe);
          this.navigate("/");
        } catch (error) {
          this.view.displayErrorMessage(
            `Failed to register user because of exception: ${error}`
          );
        } finally {
          this.view.setIsLoading(false);
        }
      };
}