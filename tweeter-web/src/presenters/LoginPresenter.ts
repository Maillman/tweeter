import { AuthPresenter, AuthView } from "./AuthPresenter";

export interface LoginView extends AuthView {
    originalUrl?: string;
}

export class LoginPresenter extends AuthPresenter<LoginView> {
    public checkSubmitButtonStatus(): boolean {
      return !this.view.alias || !this.view.password;
    };
    public doAuthentication(): Promise<void> {
      return this.doAuthenticationOperation(async () => {
        return await this.userService.login(this.view.alias, this.view.password);
      }, "log user in")
    }
    protected doNavigation(): void {
      if (!!this.view.originalUrl) {
        this.navigate(this.view.originalUrl);
      } else {
        this.navigate("/");
      }
    }
}