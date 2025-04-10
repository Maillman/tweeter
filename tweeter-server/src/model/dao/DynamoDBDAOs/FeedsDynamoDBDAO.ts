import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  BatchWriteCommandOutput,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { FeedsDAO } from "../FeedsDAO";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { StatusDto, UserDto } from "tweeter-shared";
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
  async batchPutFeed(userHandles: string[], status: StatusDto): Promise<void> {
    const params = {
      RequestItems: {
        [this.tableName]: this.createPutFeedRequestItems(userHandles, status),
      },
    };
    try {
      console.log(params);
      const resp = await this.client.send(new BatchWriteCommand(params));
      await this.putUnprocessedItems(resp, params);
    } catch (err) {
      throw new Error(
        `Error while batch writing feeds with params: ${params}: \n${err}`
      );
    }
  }
  private createPutFeedRequestItems(userHandles: string[], status: StatusDto) {
    return userHandles.map((userHandle) =>
      this.createPutFeedRequest(userHandle, status)
    );
  }
  private createPutFeedRequest(userHandle: string, status: StatusDto) {
    const item = {
      [this.handleAttr]: userHandle,
      [this.statusTimestampAttr]: status.timestamp,
      [this.postAttr]: status.post,
      [this.authorHandleAttr]: status.user.alias,
    };

    return {
      PutRequest: {
        Item: item,
      },
    };
  }
  private async putUnprocessedItems(
    resp: BatchWriteCommandOutput,
    params: BatchWriteCommandInput
  ) {
    let delay = 10;
    let attempts = 0;

    while (
      resp.UnprocessedItems !== undefined &&
      Object.keys(resp.UnprocessedItems).length > 0
    ) {
      attempts++;

      if (attempts > 1) {
        // Pause before the next attempt
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Increase pause time for next attempt
        if (delay < 1000) {
          delay += 100;
        }
      }

      console.log(
        `Attempt ${attempts}. Processing ${
          Object.keys(resp.UnprocessedItems).length
        } unprocessed feed items.`
      );

      params.RequestItems = resp.UnprocessedItems;
      resp = await this.client.send(new BatchWriteCommand(params));
    }
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
