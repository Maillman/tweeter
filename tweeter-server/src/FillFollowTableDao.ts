import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  BatchWriteCommandOutput,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

export class FillFollowTableDao {
  //
  // Modify these values as needed to match your follow table.
  //
  private readonly tableName = "follows";
  private readonly followerAliasAttribute = "follower_handle";
  private readonly followeeAliasAttribute = "followee_handle";

  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());

  async createFollows(followeeAlias: string, followerAliasList: string[]) {
    if (followerAliasList.length == 0) {
      console.log("Zero followers to batch write");
      return;
    } else {
      const params = {
        RequestItems: {
          [this.tableName]: this.createPutFollowRequestItems(
            followeeAlias,
            followerAliasList
          ),
        },
      };

      try {
        const response = await this.client.send(new BatchWriteCommand(params));
        await this.putUnprocessedItems(response, params);
      } catch (err) {
        throw new Error(
          `Error while batch writing follows with params: ${params} \n${err}`
        );
      }
    }
  }

  private createPutFollowRequestItems(
    followeeAlias: string,
    followerAliasList: string[]
  ) {
    return followerAliasList.map((followerAlias) =>
      this.createPutFollowRequest(followerAlias, followeeAlias)
    );
  }

  private createPutFollowRequest(followerAlias: string, followeeAlias: string) {
    const item = {
      [this.followerAliasAttribute]: followerAlias,
      [this.followeeAliasAttribute]: followeeAlias,
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
        } unprocessed follow items.`
      );

      params.RequestItems = resp.UnprocessedItems;
      resp = await this.client.send(new BatchWriteCommand(params));
    }
  }
}
