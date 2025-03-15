import {
  PagedUserItemRequest,
  PagedUserItemResponse,
  StatusDto,
} from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { PagedUserItemHandler } from "../PagedUserItemHandler";

export const handler = async (
  request: PagedUserItemRequest<StatusDto>
): Promise<PagedUserItemResponse<StatusDto>> => {
  return PagedUserItemHandler(
    (token, userAlias, pageSize, lastItem) =>
      new StatusService().loadMoreStoryItems(
        token,
        userAlias,
        pageSize,
        lastItem
      ),
    request
  );
};
