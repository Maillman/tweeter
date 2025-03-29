import { User, AuthToken } from "tweeter-shared";
import { View, Presenter } from "./Presenter";
import { useNavigate } from "react-router-dom";
import { UserService } from "../model/service/UserService";

export interface AuthView extends View {
  setIsLoading: (isLoading: boolean) => void;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
}

export abstract class AuthPresenter<V extends AuthView> extends Presenter<V> {
  private _userService: UserService;

  private _navigate = useNavigate();

  private isAuthenticating: boolean = false;

  public constructor(view: V) {
    super(view);
    this._userService = new UserService();
  }

  protected get userService() {
    return this._userService;
  }

  protected get navigate() {
    return this._navigate;
  }

  public updateView(view: V) {
    this.view = view;
  }

  protected abstract checkSubmitButtonStatus(
    alias: string,
    password: string
  ): boolean;

  public authenticateOnEnter(
    event: React.KeyboardEvent<HTMLElement>,
    alias: string,
    password: string,
    rememberMe: boolean
  ) {
    if (
      event.key == "Enter" &&
      !this.checkSubmitButtonStatus(alias, password)
    ) {
      this.doAuthentication(alias, password, rememberMe);
    }
  }

  protected abstract doAuthentication(
    alias: string,
    password: string,
    rememberMe: boolean
  ): Promise<void>;

  protected abstract doNavigation(): void;

  protected async doAuthenticationOperation(
    operation: () => Promise<[User, AuthToken]>,
    itemDescription: string,
    rememberMe: boolean
  ) {
    if (this.isAuthenticating) return;
    this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      this.isAuthenticating = true;
      const [user, authToken] = await operation();
      this.isAuthenticating = false;
      this.view.updateUserInfo(user, user, authToken, rememberMe);
      this.doNavigation();
    }, itemDescription);
    this.view.setIsLoading(false);
  }
}
