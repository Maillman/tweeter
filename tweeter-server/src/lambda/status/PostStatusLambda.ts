import { UpdateItemRequest, TweeterResponse, StatusDto } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";

export const handler = async (
  request: UpdateItemRequest<StatusDto>
): Promise<TweeterResponse> => {
  await new StatusService().postStatus(request.token, request.item);
  return {
    success: true,
    message: null,
  };
};
