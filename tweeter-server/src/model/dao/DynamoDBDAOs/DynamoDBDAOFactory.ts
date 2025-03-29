import { DAOFactory } from "../DAOFactory";
import { FollowsDAO } from "../FollowsDAO";
import { ImageDAO } from "../ImageDAO";
import { SessionsDAO } from "../SessionsDAO";
import { UsersDAO } from "../UsersDAO";
import { FollowsDynamoDBDAO } from "./FollowsDynamoDBDAO";
import { ImageS3DAO } from "./ImageS3DAO";
import { SessionsDynamoDBDAO } from "./SessionsDynamoDBDAO";
import { UsersDynamoDBDAO } from "./UsersDynamoDBDAO";

export class DynamoDBDAOFactory implements DAOFactory {
  getUsersDAO(): UsersDAO {
    return new UsersDynamoDBDAO();
  }
  getFollowsDAO(): FollowsDAO {
    return new FollowsDynamoDBDAO();
  }
  getSessionsDAO(): SessionsDAO {
    return new SessionsDynamoDBDAO();
  }
  //Because S3 and DynamoDB are closely related, I'm grouping the S3DAO here too.
  getImageDAO(): ImageDAO {
    return new ImageS3DAO();
  }
}
