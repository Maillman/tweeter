import { TweeterRequest } from "./TweeterRequest";

export interface AuthenticationRequest extends TweeterRequest {
  readonly alias: string;
  readonly password: string;
}
