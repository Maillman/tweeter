import { AuthenticationRequest, AuthenticationResponse } from "tweeter-shared";
import { AuthenticationHandler } from "./AuthenticationHandler";

export const handler = async (
  request: AuthenticationRequest
): Promise<AuthenticationResponse> => {
  return await AuthenticationHandler(request);
};
