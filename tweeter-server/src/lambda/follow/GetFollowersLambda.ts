import {
  PagedUserItemRequest,
  PagedUserItemResponse,
  UserDto,
} from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { PagedUserItemHandler } from "../PagedUserItemHandler";

export const handler = async (
  request: PagedUserItemRequest<UserDto>
): Promise<PagedUserItemResponse<UserDto>> => {
  return PagedUserItemHandler(
    (token, userAlias, pageSize, lastItem) =>
      new FollowService().loadMoreFollowers(
        token,
        userAlias,
        pageSize,
        lastItem
      ),
    request
  );
};
