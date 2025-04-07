import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DAOFactory } from "../DAOFactory";
import { FeedsDAO } from "../FeedsDAO";
import { FollowsDAO } from "../FollowsDAO";
import { ImageDAO } from "../ImageDAO";
import { SessionsDAO } from "../SessionsDAO";
import { StoriesDAO } from "../StoriesDAO";
import { UsersDAO } from "../UsersDAO";
import { FeedsDynamoDBDAO } from "./FeedsDynamoDBDAO";
import { FollowsDynamoDBDAO } from "./FollowsDynamoDBDAO";
import { ImageS3DAO } from "./ImageS3DAO";
import { SessionsDynamoDBDAO } from "./SessionsDynamoDBDAO";
import { StoriesDynamoDBDAO } from "./StoriesDynamoDBDAO";
import { UsersDynamoDBDAO } from "./UsersDynamoDBDAO";

export class DynamoDBDAOFactory implements DAOFactory {
  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());
  getUsersDAO(): UsersDAO {
    return new UsersDynamoDBDAO(this.client);
  }
  getFollowsDAO(): FollowsDAO {
    return new FollowsDynamoDBDAO(this.client);
  }
  getSessionsDAO(): SessionsDAO {
    return new SessionsDynamoDBDAO(this.client);
  }
  getStoriesDAO(): StoriesDAO {
    return new StoriesDynamoDBDAO(this.client);
  }
  getFeedsDAO(): FeedsDAO {
    return new FeedsDynamoDBDAO(this.client);
  }
  //Because S3 and DynamoDB are closely related, I'm grouping the S3DAO here too.
  getImageDAO(): ImageDAO {
    return new ImageS3DAO();
  }
}
