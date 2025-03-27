import { ItemRequest, ItemResponse, UserDto } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDBDAOFactory } from "../../model/dao/DynamoDBDAOs/DynamoDBDAOFactory";

export const handler = async (
  request: ItemRequest<string>
): Promise<ItemResponse<UserDto | null>> => {
  const user = await new UserService(new DynamoDBDAOFactory()).getUser(
    request.token,
    request.item
  );
  return {
    success: true,
    message: null,
    item: user,
  };
};
