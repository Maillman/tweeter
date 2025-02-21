import { User } from "tweeter-shared";
import { PagedItemPresenter, PagedItemView } from "./PagedItemPresenter";
import { FollowService } from "../model/service/FollowService";

export interface UserItemView extends PagedItemView<User> {}

export abstract class UserItemPresenter extends PagedItemPresenter<User, FollowService, UserItemView> {
    protected createService(): FollowService {
        return new FollowService();
    }
}