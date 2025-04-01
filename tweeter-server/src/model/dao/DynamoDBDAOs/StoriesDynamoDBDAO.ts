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
    pageSize: number = 5,
    lastTimestamp: number | undefined = undefined
  ): Promise<DataPage<Story>> {
    const params = {
      KeyConditionExpression: this.handleAttr + " = :hl",
      ExpressionAttributeValues: {
        ":hl": userAlias,
      },
      TableName: this.tableName,
      Limit: pageSize,
      ExclusiveStartKey:
        lastTimestamp === undefined
          ? undefined
          : {
              [this.handleAttr]: userAlias,
              [this.statusTimestampAttr]: lastTimestamp,
            },
    };

    const items: Story[] = [];
    const data = await this.client.send(new QueryCommand(params));
    const hasMorePages = data.LastEvaluatedKey !== undefined;
    data.Items?.forEach((item) =>
      items.push(
        new Story(
          item[this.handleAttr],
          item[this.statusTimestampAttr],
          item[this.postAttr]
        )
      )
    );

    return new DataPage<Story>(items, hasMorePages);
  }
  async deleteStory(status: StatusDto): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
