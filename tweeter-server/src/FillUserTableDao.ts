import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
  BatchWriteCommandInput,
  BatchWriteCommandOutput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import * as bcrypt from "bcryptjs";
import { User } from "tweeter-shared";

export class FillUserTableDao {
  //
  // Modify these values as needed to match your user table.
  //
  private readonly tableName = "users";
  private readonly userAliasAttribute = "handle";
  private readonly userFirstNameAttribute = "first_name";
  private readonly userLastNameAttribute = "last_name";
  private readonly userImageUrlAttribute = "image_url";
  private readonly passwordHashAttribute = "password";
  private readonly followeeCountAttribute = "followee_count";
  private readonly followerCountAttribute = "follower_count";

  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());

  async createUsers(userList: User[], password: string) {
    if (userList.length == 0) {
      console.log("zero followers to batch write");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const params = {
      RequestItems: {
        [this.tableName]: this.createPutUserRequestItems(
          userList,
          hashedPassword
        ),
      },
    };

    try {
      const resp = await this.client.send(new BatchWriteCommand(params));
      await this.putUnprocessedItems(resp, params);
    } catch (err) {
      throw new Error(
        `Error while batch writing users with params: ${params}: \n${err}`
      );
    }
  }

  private createPutUserRequestItems(userList: User[], hashedPassword: string) {
    return userList.map((user) =>
      this.createPutUserRequest(user, hashedPassword)
    );
  }

  private createPutUserRequest(user: User, hashedPassword: string) {
    const item = {
      [this.userAliasAttribute]: user.alias,
      [this.userFirstNameAttribute]: user.firstName,
      [this.userLastNameAttribute]: user.lastName,
      [this.passwordHashAttribute]: hashedPassword,
      [this.userImageUrlAttribute]: user.imageUrl,
      [this.followerCountAttribute]: 0,
      [this.followeeCountAttribute]: 1,
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
        } unprocessed users.`
      );

      params.RequestItems = resp.UnprocessedItems;
      resp = await this.client.send(new BatchWriteCommand(params));
    }
  }

  async increaseFollowersCount(alias: string, count: number): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Key: { [this.userAliasAttribute]: alias },
      ExpressionAttributeValues: { ":inc": count },
      UpdateExpression:
        "SET " +
        this.followerCountAttribute +
        " = " +
        this.followerCountAttribute +
        " + :inc",
    };

    try {
      await this.client.send(new UpdateCommand(params));
      return true;
    } catch (err) {
      console.error("Error while updating followers count:", err);
      return false;
    }
  }
}
