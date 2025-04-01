import { ItemRequest, TweeterResponse, StatusDto } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { DynamoDBDAOFactory } from "../../model/dao/DynamoDBDAOs/DynamoDBDAOFactory";

export const handler = async (
  request: ItemRequest<StatusDto>
): Promise<TweeterResponse> => {
  await new StatusService(new DynamoDBDAOFactory()).postStatus(
    request.token,
    request.item
  );
  return {
    success: true,
    message: null,
  };
};
