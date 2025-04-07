import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { FeedsDAO } from "../FeedsDAO";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { StatusDto } from "tweeter-shared";
import { DataPage } from "../../entity/DataPage";
import { Story } from "../../entity/Story";

export class FeedsDynamoDBDAO implements FeedsDAO {
  readonly tableName = "feeds";
  readonly handleAttr = "handle";
  readonly statusTimestampAttr = "status_timestamp";
  readonly authorHandleAttr = "author_handle";
  readonly postAttr = "post";

  private readonly client;

  constructor(client: DynamoDBDocumentClient) {
    this.client = client;
  }

  async putFeed(handle: string, status: StatusDto): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.handleAttr]: handle,
        [this.statusTimestampAttr]: status.timestamp,
        [this.postAttr]: status.post,
        [this.authorHandleAttr]: status.user.alias,
      },
    };
    await this.client.send(new PutCommand(params));
  }
  async getPageOfFeed(
    userAlias: string,
    pageSize: number = 5,
    lastTimestamp: number | undefined
  ): Promise<DataPage<Story>> {
    const params = {
      KeyConditionExpression: this.handleAttr + " = :hl",
      ExpressionAttributeValues: {
        ":hl": userAlias,
      },
      TableName: this.tableName,
      Limit: pageSize,
      ScanIndexForward: false,
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
          item[this.authorHandleAttr],
          item[this.statusTimestampAttr],
          item[this.postAttr]
        )
      )
    );

    return new DataPage<Story>(items, hasMorePages);
  }
  deleteFeed(status: StatusDto): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
