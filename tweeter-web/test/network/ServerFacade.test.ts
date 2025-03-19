import { ServerFacade } from "../../src/network/ServerFacade";
import "isomorphic-fetch";

describe("ServerFacade", () => {
  let serverFacade: ServerFacade = new ServerFacade();
  let userDto = {
    firstName: "Melvin",
    lastName: "Whitaker",
    alias: "@Melvin",
    imageUrl: "image",
  };
  it("registers", async () => {
    const [user, authToken] = await serverFacade.register({
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      imageStringBase64: "imageStringBase64",
      imageFileExtension: "png",
      alias: userDto.alias,
      password: "MyPassword",
    });
    expect(user).not.toBeNull();
    expect(authToken).not.toBeNull();
  });
  it("gets followers", async () => {
    const [users] = await serverFacade.getMoreFollowers({
      token: "myAuthToken",
      userAlias: userDto.alias,
      pageSize: 5,
      lastItem: null,
    });
    expect(users).not.toBeNull();
  });
  it("gets follower count", async () => {
    const followerCount = await serverFacade.getFollowerCount({
      token: "myAuthToken",
      item: userDto,
    });
    expect(followerCount).toBeGreaterThanOrEqual(0);
  });
  it("gets followee count", async () => {
    const followeeCount = await serverFacade.getFolloweeCount({
      token: "myAuthToken",
      item: userDto,
    });
    expect(followeeCount).toBeGreaterThanOrEqual(0);
  });
});
