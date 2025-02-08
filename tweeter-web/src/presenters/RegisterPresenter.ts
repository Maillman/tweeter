import { UserService } from "../model/service/UserService";

export interface RegisterView {

}

export class RegisterPresenter {
    private userService: UserService;
    private _view: RegisterView;

    public constructor(view: RegisterView){
        this._view = view;
        this.userService = new UserService;
    }
}