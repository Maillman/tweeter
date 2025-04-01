import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { StatusDto } from "tweeter-shared";
import { DataPage } from "../../entity/DataPage";
import { StoriesDAO } from "../StoriesDAO";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Story } from "../../entity/Story";

export class StoriesDynamoDBDAO implements StoriesDAO {
  readonly tableName = "stories";
  readonly handleAttr = "handle";
  readonly statusTimestampAttr = "status_timestamp";
  readonly postAttr = "post";

  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());

  async putStory(status: StatusDto): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.handleAttr]: status.user.alias,
        [this.statusTimestampAttr]: status.timestamp,
        [this.postAttr]: status.post,
      },
    };
    await this.client.send(new PutCommand(params));
  }
  async getPageOfStories(
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<DataPage<Story>> {
    throw new Error("Method not implemented.");
  }
  async deleteStory(status: StatusDto): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
