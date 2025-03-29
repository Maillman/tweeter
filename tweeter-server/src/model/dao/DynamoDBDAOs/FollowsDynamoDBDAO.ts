import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DataPage } from "../../entity/DataPage";
import { Follow } from "../../entity/Follow";
import { FollowsDAO } from "../FollowsDAO";

export class FollowsDynamoDBDAO implements FollowsDAO {
  readonly tableName = "follows";
  readonly indexName = "follows_index";
  readonly followerHandleAttr = "follower_handle";
  readonly followeeHandleAttr = "followee_handle";

  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());

  async putFollow(follow: Follow): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.followerHandleAttr]: follow.followerHandle,
        [this.followeeHandleAttr]: follow.followeeHandle,
      },
    };
    await this.client.send(new PutCommand(params));
  }

  async updateFollow(follower: Follow): Promise<void> {
    // const params = {
    //   TableName: this.tableName,
    //   Key: this.generateFollowItem(follower),
    //   ExpressionAttributeValues: {
    //     ":foe": follower.follower,
    //     ":for": follower.followee,
    //   },
    //   UpdateExpression:
    //     "SET " +
    //     this.followeeNameAttr +
    //     " = " +
    //     ":foe," +
    //     "" +
    //     this.followerNameAttr +
    //     " = " +
    //     ":for",
    // };
    // await this.client.send(new UpdateCommand(params));
    throw new Error("I'm unsure if I want to keep this method");
  }

  async getFollow(follow: Follow): Promise<Follow | undefined> {
    const params = {
      TableName: this.tableName,
      Key: this.generateFollowItem(follow),
    };
    const output = await this.client.send(new GetCommand(params));
    return output.Item == undefined
      ? undefined
      : new Follow(
          output.Item[this.followerHandleAttr],
          output.Item[this.followeeHandleAttr]
        );
  }

  async deleteFollow(follow: Follow): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: this.generateFollowItem(follow),
    };
    await this.client.send(new DeleteCommand(params));
  }

  //
  // DynamoDB Part 2
  //

  async getPageOfFollowees(
    followerHandle: string,
    lastFolloweeHandle: string | undefined = undefined,
    pageSize: number = 5
  ): Promise<DataPage<Follow>> {
    const params = {
      KeyConditionExpression: this.followerHandleAttr + " = :fhl",
      ExpressionAttributeValues: {
        ":fhl": followerHandle,
      },
      TableName: this.tableName,
      Limit: pageSize,
      ExclusiveStartKey:
        lastFolloweeHandle === undefined
          ? undefined
          : {
              [this.followerHandleAttr]: followerHandle,
              [this.followeeHandleAttr]: lastFolloweeHandle,
            },
    };

    const items: Follow[] = [];
    const data = await this.client.send(new QueryCommand(params));
    const hasMorePages = data.LastEvaluatedKey !== undefined;
    data.Items?.forEach((item) =>
      items.push(
        new Follow(item[this.followerHandleAttr], item[this.followeeHandleAttr])
      )
    );

    return new DataPage<Follow>(items, hasMorePages);
  }

  async getPageOfFollowers(
    followeeHandle: string,
    lastFollowerHandle: string | undefined = undefined,
    pageSize: number = 5
  ): Promise<DataPage<Follow>> {
    const params = {
      KeyConditionExpression: this.followeeHandleAttr + " = :fhl",
      ExpressionAttributeValues: {
        ":fhl": followeeHandle,
      },
      TableName: this.tableName,
      IndexName: this.indexName,
      Limit: pageSize,
      ExclusiveStartKey:
        lastFollowerHandle === undefined
          ? undefined
          : {
              [this.followeeHandleAttr]: followeeHandle,
              [this.followerHandleAttr]: lastFollowerHandle,
            },
    };

    const items: Follow[] = [];
    const data = await this.client.send(new QueryCommand(params));
    const hasMorePages = data.LastEvaluatedKey !== undefined;
    data.Items?.forEach((item) =>
      items.push(
        new Follow(item[this.followerHandleAttr], item[this.followeeHandleAttr])
      )
    );

    return new DataPage<Follow>(items, hasMorePages);
  }

  //
  // End of DynamoDB part 2
  //

  private generateFollowItem(follow: Follow) {
    return {
      [this.followerHandleAttr]: follow.followerHandle,
      [this.followeeHandleAttr]: follow.followeeHandle,
    };
  }
}
