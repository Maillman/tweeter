import {
  PagedUserItemRequest,
  PagedUserItemResponse,
  StatusDto,
} from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { PagedUserItemHandler } from "../PagedUserItemHandler";
import { DynamoDBDAOFactory } from "../../model/dao/DynamoDBDAOs/DynamoDBDAOFactory";

export const handler = async (
  request: PagedUserItemRequest<StatusDto>
): Promise<PagedUserItemResponse<StatusDto>> => {
  return PagedUserItemHandler(
    (token, userAlias, pageSize, lastItem) =>
      new StatusService(new DynamoDBDAOFactory()).loadMoreStoryItems(
        token,
        userAlias,
        pageSize,
        lastItem
      ),
    request
  );
};
