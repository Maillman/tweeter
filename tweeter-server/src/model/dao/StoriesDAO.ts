import { StatusDto } from "tweeter-shared";
import { DataPage } from "../entity/DataPage";
import { Story } from "../entity/Story";

export interface StoriesDAO {
  putStory(status: StatusDto): Promise<void>;
  getPageOfStories(
    userAlias: string,
    pageSize: number,
    lastTimestamp: number | undefined
  ): Promise<DataPage<Story>>;
  deleteStory(status: StatusDto): Promise<void>;
}
