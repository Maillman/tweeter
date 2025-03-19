import { FollowResponse, ItemRequest, UserDto } from "tweeter-shared";

export const FollowHandler = async (
  serviceMethod: (token: string, user: UserDto) => Promise<[number, number]>,
  request: ItemRequest<UserDto>
): Promise<FollowResponse> => {
  const [followerCount, followeeCount] = await serviceMethod(
    request.token,
    request.item
  );
  return {
    success: true,
    message: null,
    followerCount: followerCount,
    followeeCount: followeeCount,
  };
};
