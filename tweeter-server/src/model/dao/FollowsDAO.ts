import { Follow } from "../entity/Follow";
import { DataPage } from "../entity/DataPage";

export interface FollowsDAO {
  putFollow(follow: Follow): Promise<void>;
  updateFollow(follower: Follow): Promise<void>;
  getFollow(follow: Follow): Promise<Follow | undefined>;
  deleteFollow(follow: Follow): Promise<void>;
  getPageOfFollowees(
    followerHandle: string,
    lastFolloweeHandle: string | undefined,
    pageSize: number
  ): Promise<DataPage<Follow>>;
  getPageOfFollowers(
    followeeHandle: string,
    lastFollowerHandle: string | undefined,
    pageSize: number
  ): Promise<DataPage<Follow>>;
}
