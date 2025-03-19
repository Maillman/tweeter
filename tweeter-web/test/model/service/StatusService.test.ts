import { AuthToken } from "tweeter-shared";
import { StatusService } from "../../../src/model/service/StatusService";
import "isomorphic-fetch";

describe("StatusService", () => {
  let service: StatusService = new StatusService();
  let authToken: AuthToken = new AuthToken("myAuthToken", Date.now());
  it("gets story items", async () => {
    expect(
      async () =>
        await service.loadMoreStoryItems(authToken, "@Melvin", 5, null)
    ).not.toThrow();
  });
});
