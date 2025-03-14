import { AuthenticationRequest } from "./AuthenticationRequest";

export interface RegisterRequest extends AuthenticationRequest {
  readonly firstName: string;
  readonly lastName: string;
  readonly imageStringBase64: string;
  readonly imageFileExtension: string;
}
