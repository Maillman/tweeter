import { AuthPresenter, AuthView } from "./AuthPresenter";

export interface LoginView extends AuthView {
  originalUrl?: string;
}

export class LoginPresenter extends AuthPresenter<LoginView> {
  public checkSubmitButtonStatus(alias: string, password: string): boolean {
    return !alias || !password;
  }
  public doAuthentication(
    alias: string,
    password: string,
    rememberMe: boolean
  ): Promise<void> {
    return this.doAuthenticationOperation(
      async () => {
        return await this.userService.login(alias, password);
      },
      "log user in",
      rememberMe
    );
  }
  protected doNavigation(): void {
    if (!!this.view.originalUrl) {
      this.navigate(this.view.originalUrl);
    } else {
      this.navigate("/");
    }
  }
}
