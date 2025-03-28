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
import { UsersDAO } from "../dao/UsersDAO";
import { ImageDAO } from "../dao/ImageDAO";
import { SessionsDAO } from "../dao/SessionsDAO";

export class UserService {
  private daoFactory: DAOFactory;
  private usersDAO: UsersDAO;
  private sessionsDAO: SessionsDAO;
  private imageDAO: ImageDAO;
  constructor(daoFactory: DAOFactory) {
    this.daoFactory = daoFactory;
    this.usersDAO = daoFactory.getUsersDAO();
    this.sessionsDAO = daoFactory.getSessionsDAO();
    this.imageDAO = daoFactory.getImageDAO();
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[UserDto, AuthTokenDto]> {
    //Get user in database
    const userAndPassword = await this.usersDAO.getUser(alias);

    if (userAndPassword === undefined) {
      throw new Error("[Bad Request] Invalid alias");
    }

    const [user, hashedPassword] = userAndPassword;

    //Check password w/ hashedPassword
    if (!(await bcrypt.compare(password, hashedPassword))) {
      throw new Error("[Bad Request] Invalid password");
    }

    const authToken = await this.createAndStoreAuthToken();
    return [user.dto, authToken.dto];
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageStringBase64: string,
    imageFileExtension: string
  ): Promise<[UserDto, AuthTokenDto]> {
    //Check for invalid parameters
    if (!firstName || !lastName || !alias || !password) {
      throw new Error("[Bad Request] Missing required information");
    }
    //Check if user is already in database
    const registeredUser = await this.usersDAO.getUser(alias);
    if (registeredUser !== undefined) {
      throw new Error("[Bad Request] Alias already taken");
    }

    //Uploading image to database
    const fileName = uuid().toString() + imageFileExtension;
    const imageUrl = await this.imageDAO.putImage(fileName, imageStringBase64);
    //Hashing password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    //Storing user in database
    const user = new User(firstName, lastName, alias, imageUrl);
    await this.usersDAO.putUser(user, hashedPassword);

    if (user === null) {
      throw new Error("[Bad Request] Invalid registration");
    }

    const authToken = await this.createAndStoreAuthToken();
    return [user.dto, authToken.dto];
  }

  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    // TODO: Replace with the result of calling server
    const user = FakeData.instance.findUserByAlias(alias);

    return user ? user.dto : null;
  }

  public async logout(token: string): Promise<void> {
    await this.sessionsDAO.deleteAuthToken(token);
  }

  private async createAndStoreAuthToken(): Promise<AuthToken> {
    const token = uuid().toString();
    const timestamp = Date.now();

    await this.sessionsDAO.putAuthToken(token, timestamp);

    return new AuthToken(token, timestamp);
  }
}
