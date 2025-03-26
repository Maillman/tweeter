import { User } from "tweeter-shared";

export interface UsersDAO {
  putUser(user: User, hashedPassword: string): Promise<void>;
  getUser(handle: string): Promise<[User, string] | undefined>;
  deleteUser(handle: string): Promise<void>;
}
