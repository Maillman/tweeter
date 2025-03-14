import { AuthenticationResponse, RegisterRequest } from "tweeter-shared";
import { AuthenticationHandler } from "./AuthenticationHandler";

export const handler = async (
  request: RegisterRequest
): Promise<AuthenticationResponse> => {
  return await AuthenticationHandler(request);
};
