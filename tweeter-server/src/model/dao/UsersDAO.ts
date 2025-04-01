import { User } from "tweeter-shared";

export interface UsersDAO {
  putUser(
    user: User,
    hashedPassword: string,
    followerCount: number,
    followeeCount: number
  ): Promise<void>;
  updateUserFollowRelationship(
    handle: string,
    followerChange: number,
    followeeChange: number
  ): Promise<void>;
  getUser(handle: string): Promise<[User, string, number, number] | undefined>;
  deleteUser(handle: string): Promise<void>;
}
