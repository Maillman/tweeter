import { User, AuthToken } from "tweeter-shared";
import { View, Presenter } from "./Presenter";
import { useNavigate } from "react-router-dom";
import { UserService } from "../model/service/UserService";

export interface AuthView extends View {
    alias: string
    password: string
    rememberMe: boolean
    setIsLoading: (isLoading: boolean) => void
    updateUserInfo: (currentUser: User, displayedUser: User | null, authToken: AuthToken, remember: boolean) => void
}

export abstract class AuthPresenter<V extends AuthView> extends Presenter<V> {
    private _userService: UserService;

    private _navigate = useNavigate();

    public constructor(view: V){
        super(view);
        this._userService = new UserService;
    }
    
    protected get userService() {
        return this._userService;
    }

    protected get navigate() {
        return this._navigate;
    }

    public updateView(view: V){
        this.view = view;
    }

    protected abstract checkSubmitButtonStatus(): boolean;

    public authenticateOnEnter(event: React.KeyboardEvent<HTMLElement>) {
        if (event.key == "Enter" && !this.checkSubmitButtonStatus()) {
          this.doAuthentication();
        }
    }

    protected abstract doAuthentication(): Promise<void>;

    protected abstract doNavigation(): void;

    protected async doAuthenticationOperation(operation: () => Promise<[User, AuthToken]>, itemDescription: string) {
        this.doFailureReportingOperation(async () => {
            this.view.setIsLoading(true);
            const [user, authToken] = await operation();
            this.view.updateUserInfo(user, user, authToken, this.view.rememberMe);
            this.doNavigation();
        }, itemDescription);
        this.view.setIsLoading(false);
    }
;

}