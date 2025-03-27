import { FollowsDAO } from "./FollowsDAO";
import { ImageDAO } from "./ImageDAO";
import { UsersDAO } from "./UsersDAO";

export interface DAOFactory {
  getUsersDAO(): UsersDAO;
  getFollowsDAO(): FollowsDAO;
  getImageDAO(): ImageDAO;
}
