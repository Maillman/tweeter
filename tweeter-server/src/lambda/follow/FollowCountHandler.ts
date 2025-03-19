import { FollowCountResponse, ItemRequest, UserDto } from "tweeter-shared";

export const FollowCountHandler = async (
  serviceMethod: (token: string, user: UserDto) => Promise<number>,
  request: ItemRequest<UserDto>
): Promise<FollowCountResponse> => {
  const count = await serviceMethod(request.token, request.item);
  return {
    success: true,
    message: null,
    count: count,
  };
};
