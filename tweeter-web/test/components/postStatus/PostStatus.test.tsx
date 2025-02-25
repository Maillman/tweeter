import { render, screen } from "@testing-library/react";
import PostStatus from "../../../src/components/postStatus/PostStatus";
import React from "react";
import {
  PostStatusView,
  PostStatusPresenter,
} from "../../../src/presenters/PostStatusPresenter";
import "@testing-library/jest-dom";
import userEvent, { UserEvent } from "@testing-library/user-event";
import useUserInfo from "../../../src/components/userInfo/userInfoHook";
import { User, AuthToken } from "tweeter-shared";
import { anything, instance, mock, verify } from "@typestrong/ts-mockito";

jest.mock("../../../src/components/userInfo/UserInfoHook", () => ({
  ...jest.requireActual("../../../src/components/userInfo/UserInfoHook"),
  __esModule: true,
  default: jest.fn(),
}));

describe("PostStatus Component", () => {
  const currentUser = new User(
    "john",
    "doe",
    "jd128",
    "newImage.com/checkThisImageOut"
  );
  const authToken = new AuthToken("abc123", Date.now());

  beforeAll(() => {
    (useUserInfo as jest.Mock).mockReturnValue({
      currentUser: currentUser,
      authToken: authToken,
    });
  });

  it("starts with the post status and clear buttons disabled", () => {
    const { postStatusButton, clearButton } = renderPostStatusAndGetElement();
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("enables both the post status and clear buttons when the text field has text", async () => {
    const { postStatusButton, clearButton, postTextField, user } =
      renderPostStatusAndGetElement();

    await testButtonOnInput(user, postTextField, postStatusButton, clearButton);
  });

  it("disables both the post status and clear buttons when the text field is cleared", async () => {
    const { postStatusButton, clearButton, postTextField, user } =
      renderPostStatusAndGetElement();

    await testButtonOnInput(user, postTextField, postStatusButton, clearButton);

    user.clear(postTextField);
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("calls the presenter's postStatus method with correct parameters when the post status button is pressed", async () => {
    const mockPresenter: PostStatusPresenter = mock<PostStatusPresenter>();
    const mockPresenterInstance: PostStatusPresenter = instance(mockPresenter);

    const post = "post";
    const { postStatusButton, postTextField, user } =
      renderPostStatusAndGetElement(mockPresenterInstance);

    await user.type(postTextField, post);

    await user.click(postStatusButton);

    verify(
      mockPresenter.submitPost(anything(), post, currentUser, authToken)
    ).once();
  });
});

const renderPostStatus = (presenter?: PostStatusPresenter) => {
  return render(
    <PostStatus
      presenterGenerator={(view: PostStatusView) =>
        presenter ?? new PostStatusPresenter(view)
      }
    />
  );
};

const renderPostStatusAndGetElement = (presenter?: PostStatusPresenter) => {
  const user = userEvent.setup();

  renderPostStatus(presenter);

  const postTextField = screen.getByLabelText("postStatusText");
  const postStatusButton = screen.getByRole("button", { name: /Post Status/i });
  const clearButton = screen.getByRole("button", { name: /Clear/i });

  return { postStatusButton, clearButton, postTextField, user };
};

async function testButtonOnInput(
  user: UserEvent,
  postTextField: HTMLElement,
  postStatusButton: HTMLElement,
  clearButton: HTMLElement
) {
  await user.type(postTextField, "post");

  expect(postStatusButton).toBeEnabled();
  expect(clearButton).toBeEnabled();
}
