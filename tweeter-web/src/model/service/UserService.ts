import { Buffer } from "buffer";
import { User, AuthToken, FakeData } from "tweeter-shared";
import { ServerFacade } from "../../network/ServerFacade";

export class UserService {
  private serverFacade = new ServerFacade();

  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    return this.serverFacade.login({
      alias: alias,
      password: password,
    });
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    const imageStringBase64: string =
      Buffer.from(userImageBytes).toString("base64");

    return this.serverFacade.register({
      firstName: firstName,
      lastName: lastName,
      imageStringBase64: imageStringBase64,
      imageFileExtension: imageFileExtension,
      alias: alias,
      password: password,
    });
  }

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    return this.serverFacade.getUser({
      token: authToken.token,
      item: alias,
    });
  }

  public async logout(authToken: AuthToken): Promise<void> {
    return this.serverFacade.logout({
      token: authToken.token,
    });
  }
}
