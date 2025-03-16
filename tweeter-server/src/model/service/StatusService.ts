import { Status, FakeData, StatusDto } from "tweeter-shared";
import { FakeDataService } from "./FakeDataService";

export class StatusService {
  public async loadMoreFeedItems(
    authToken: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    // TODO: Replace with the result of calling server
    return FakeDataService.getFakeDataStatuses(pageSize, lastItem);
  }

  public async loadMoreStoryItems(
    authToken: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    // TODO: Replace with the result of calling server
    return FakeDataService.getFakeDataStatuses(pageSize, lastItem);
  }

  public async postStatus(
    authToken: string,
    newStatus: StatusDto
  ): Promise<void> {
    // Pause so we can see the logging out message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server to post the status
  }
}
