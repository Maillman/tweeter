import {
  User,
  AuthToken,
  FakeData,
  UserDto,
  AuthTokenDto,
} from "tweeter-shared";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";
import { DAOFactory } from "../dao/DAOFactory";

export class UserService {
  private daoFactory: DAOFactory;
  constructor(daoFactory: DAOFactory) {
    this.daoFactory = daoFactory;
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[UserDto, AuthTokenDto]> {
    // TODO: Replace with the result of calling the server
    const user = FakeData.instance.firstUser;

    if (user === null) {
      throw new Error("Invalid alias or password");
    }

    return [user.dto, FakeData.instance.authToken.dto];
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageStringBase64: string,
    imageFileExtension: string
  ): Promise<[UserDto, AuthTokenDto]> {
    //Uploading image to database
    const fileName = uuid().toString() + imageFileExtension;
    const imageUrl = await this.daoFactory
      .getImageDAO()
      .putImage(fileName, imageStringBase64);
    //Hashing password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    //Storing user in database
    const user = new User(firstName, lastName, alias, imageUrl);
    await this.daoFactory.getUsersDAO().putUser(user, hashedPassword);

    if (user === null) {
      throw new Error("Invalid registration");
    }

    return [user.dto, FakeData.instance.authToken.dto];
  }

  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    // TODO: Replace with the result of calling server
    const user = FakeData.instance.findUserByAlias(alias);

    return user ? user.dto : null;
  }

  public async logout(token: string): Promise<void> {
    // Pause so we can see the logging out message. Delete when the call to the server is implemented.
    await new Promise((res) => setTimeout(res, 1000));
  }
}
