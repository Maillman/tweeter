import { AuthenticationRequest } from "./AuthenticationRequest";

export interface RegisterRequest extends AuthenticationRequest {
  readonly firstName: string;
  readonly lastName: string;
  readonly userImageBytes: string;
  readonly imageFileExtension: string;
}
