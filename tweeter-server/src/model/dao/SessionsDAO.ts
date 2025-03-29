import { AuthToken } from "tweeter-shared";

//The timestamp provided to the DAO is always right before the method gets called.
//What get's stored in the database however is the expiration time.
export interface SessionsDAO {
  putAuthToken(token: string, timestamp: number): Promise<void>;
  getAuthToken(token: string): Promise<AuthToken | undefined>;
  deleteAuthToken(token: string): Promise<void>;
}
