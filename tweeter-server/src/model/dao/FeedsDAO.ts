import { StatusDto, UserDto } from "tweeter-shared";
import { DataPage } from "../entity/DataPage";
import { Story } from "../entity/Story";

export interface FeedsDAO {
  putFeed(handle: string, status: StatusDto): Promise<void>;
  batchPutFeed(users: UserDto[], status: StatusDto): Promise<void>;
  getPageOfFeed(
    userAlias: string,
    pageSize: number,
    lastTimestamp: number | undefined
  ): Promise<DataPage<Story>>;
  deleteFeed(status: StatusDto): Promise<void>;
}
