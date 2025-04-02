import { FeedsDAO } from "./FeedsDAO";
import { FollowsDAO } from "./FollowsDAO";
import { ImageDAO } from "./ImageDAO";
import { SessionsDAO } from "./SessionsDAO";
import { StoriesDAO } from "./StoriesDAO";
import { UsersDAO } from "./UsersDAO";

export interface DAOFactory {
  getUsersDAO(): UsersDAO;
  getFollowsDAO(): FollowsDAO;
  getSessionsDAO(): SessionsDAO;
  getStoriesDAO(): StoriesDAO;
  getFeedsDAO(): FeedsDAO;
  getImageDAO(): ImageDAO;
}
