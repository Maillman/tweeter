import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { User } from "tweeter-shared";
import { UsersDAO } from "../UsersDAO";

export class UsersDynamoDBDAO implements UsersDAO {
  readonly tableName = "users";
  readonly handleAttr = "handle";
  readonly firstNameAttr = "first_name";
  readonly lastNameAttr = "last_name";
  readonly passwordAttr = "password";
  readonly imageUrlAttr = "image_url";
  readonly followerCountAttr = "follower_count";
  readonly followeeCountAttr = "followee_count";

  private readonly client;

  constructor(client: DynamoDBDocumentClient) {
    this.client = client;
  }

  async putUser(
    user: User,
    hashedPassword: string,
    followerCount: number,
    followeeCount: number
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.handleAttr]: user.alias,
        [this.firstNameAttr]: user.firstName,
        [this.lastNameAttr]: user.lastName,
        [this.imageUrlAttr]: user.imageUrl,
        [this.passwordAttr]: hashedPassword,
        [this.followerCountAttr]: followerCount,
        [this.followeeCountAttr]: followeeCount,
      },
    };
    await this.client.send(new PutCommand(params));
  }

  async updateUserFollowRelationship(
    handle: string,
    followerChange: number,
    followeeChange: number
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { [this.handleAttr]: handle },
      ExpressionAttributeValues: {
        ":for": followerChange,
        ":foe": followeeChange,
      },
      UpdateExpression:
        "ADD " +
        this.followeeCountAttr +
        " :foe," +
        "" +
        this.followerCountAttr +
        " :for",
    };
    await this.client.send(new UpdateCommand(params));
  }

  async getUser(
    handle: string
  ): Promise<[User, string, number, number] | undefined> {
    const params = {
      TableName: this.tableName,
      Key: { [this.handleAttr]: handle },
    };
    const output = await this.client.send(new GetCommand(params));
    return output.Item === undefined
      ? undefined
      : [
          new User(
            output.Item[this.firstNameAttr],
            output.Item[this.lastNameAttr],
            output.Item[this.handleAttr],
            output.Item[this.imageUrlAttr]
          ),
          output.Item[this.passwordAttr],
          output.Item[this.followerCountAttr],
          output.Item[this.followeeCountAttr],
        ];
  }

  async deleteUser(handle: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { [this.handleAttr]: handle },
    };
    await this.client.send(new DeleteCommand(params));
  }
}
