import { Status } from "tweeter-shared";
import { PagedItemPresenter, PagedItemView } from "./PagedItemPresenter";
import { StatusService } from "../model/service/StatusService";

export interface StatusItemView extends PagedItemView<Status> {
    addItems: (newItems: Status[]) => void
}

export abstract class StatusItemPresenter extends PagedItemPresenter<Status, StatusService, StatusItemView> {
    protected createService(): StatusService {
        return new StatusService();
    }
}