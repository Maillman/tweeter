import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { AuthToken } from "tweeter-shared";
import { SessionsDAO } from "../SessionsDAO";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export class SessionsDynamoDBDAO implements SessionsDAO {
  readonly tableName = "sessions";
  readonly tokenAttr = "token";
  readonly timestampAttr = "token_timestamp";
  readonly handleAttr = "handle";

  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());

  async putAuthToken(
    token: string,
    timestamp: number,
    handle: string
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.tokenAttr]: token,
        [this.timestampAttr]: timestamp,
        [this.handleAttr]: handle,
      },
    };
    await this.client.send(new PutCommand(params));
  }
  async getUserHandle(token: string): Promise<string | undefined> {
    const params = {
      TableName: this.tableName,
      Key: { [this.tokenAttr]: token },
    };
    const output = await this.client.send(new GetCommand(params));
    return output.Item === undefined ? undefined : output.Item[this.handleAttr];
  }
  async getAuthToken(token: string): Promise<AuthToken | undefined> {
    const params = {
      TableName: this.tableName,
      Key: { [this.tokenAttr]: token },
    };
    const output = await this.client.send(new GetCommand(params));
    return output.Item === undefined
      ? undefined
      : new AuthToken(
          output.Item[this.tokenAttr],
          output.Item[this.timestampAttr]
        );
  }
  async updateAuthToken(token: string, timestamp: number): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { [this.tokenAttr]: token },
      ExpressionAttributeValues: {
        ":tsp": timestamp,
      },
      UpdateExpression: "SET " + this.timestampAttr + " = :tsp",
    };
    await this.client.send(new UpdateCommand(params));
  }
  async deleteAuthToken(token: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { [this.tokenAttr]: token },
    };
    await this.client.send(new DeleteCommand(params));
  }
}
