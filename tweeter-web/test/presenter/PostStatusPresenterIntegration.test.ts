import { AuthenticationRequest } from "tweeter-shared";
import {
  PostStatusPresenter,
  PostStatusView,
} from "../../src/presenters/PostStatusPresenter";
import { anything, instance, mock, spy, verify } from "@typestrong/ts-mockito";
import "isomorphic-fetch";
import { ServerFacade } from "../../src/network/ServerFacade";

describe("PostStatusPresenter", () => {
  let mockPostStatusView: PostStatusView;
  let serverFacade: ServerFacade;
  let postStatusPresenter: PostStatusPresenter;

  const event = anything();
  event.preventDefault = jest.fn();
  const beginTestTimestamp = Date.now();
  const post: string =
    "[LTTM]: Automated Integration Test in Progress! Time:" +
    beginTestTimestamp;
  const authenticationRequest: AuthenticationRequest = {
    alias: "@LooksToTheMoon",
    password: "FivePebbles",
  };

  beforeEach(() => {
    serverFacade = new ServerFacade();
    mockPostStatusView = mock<PostStatusView>();
    const mockPostStatusViewInstance = instance(mockPostStatusView);
    const postStatusPresenterSpy = spy(
      new PostStatusPresenter(mockPostStatusViewInstance)
    );
    postStatusPresenter = instance(postStatusPresenterSpy);
  });

  it("logs in, successfully posts a status to the server, and found the post in the story", async () => {
    //await logging in a user.
    const [user, authToken] = await serverFacade.login(authenticationRequest);

    //await posting a status.
    await postStatusPresenter.submitPost(event, post, user, authToken);

    verify(mockPostStatusView.displayErrorMessage(anything())).never();
    verify(
      mockPostStatusView.displayInfoMessage("Status posted!", 2000)
    ).once();

    //await retrieving the user's story
    const [storyItems] = await serverFacade.getMoreStoryItems({
      token: authToken.token,
      userAlias: user.alias,
      pageSize: 10,
      lastItem: null,
    });
    const latestPost = storyItems.at(0);
    if (latestPost === undefined) {
      fail("unable to retrieve latest story item");
    }
    expect(latestPost.post).toBe(post);
    expect(latestPost.user).toStrictEqual(user);
    expect(latestPost.timestamp).toBeGreaterThan(beginTestTimestamp);
  }, 10000);
});
