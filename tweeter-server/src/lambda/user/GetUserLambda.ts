import { ItemRequest, ItemResponse, UserDto } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: ItemRequest<string>
): Promise<ItemResponse<UserDto | null>> => {
  const user = await new UserService().getUser(request.token, request.item);
  return {
    success: true,
    message: null,
    item: user,
  };
};
