import React from "react";
import { MemoryRouter } from "react-router-dom";
import Login from "../../../../src/components/authentication/login/Login";
import { render, screen } from "@testing-library/react";
import {
  LoginView,
  LoginPresenter,
} from "../../../../src/presenters/LoginPresenter";
import userEvent, { UserEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { anything, instance, mock, verify } from "@typestrong/ts-mockito";

library.add(fab);

describe("Login Component", () => {
  it("start with the sign-in button disabled", () => {
    const { signInButton } = renderLoginAndGetElement("/");
    expect(signInButton).toBeDisabled();
  });

  it("enables the sign-in button if both alias and password fields have text", async () => {
    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElement("/");

    await testSignInButtonActivation(
      user,
      aliasField,
      passwordField,
      signInButton
    );
  });

  it("disables the sign-in button if either field is cleared", async () => {
    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElement("/");

    await testSignInButtonActivation(
      user,
      aliasField,
      passwordField,
      signInButton
    );

    await user.clear(aliasField);
    expect(signInButton).toBeDisabled();

    await user.type(aliasField, "1");
    expect(signInButton).toBeEnabled();

    await user.clear(passwordField);
    expect(signInButton).toBeDisabled();
  });

  it("calls the presenters login method with correct parameters when the sign-in button is pressed", async () => {
    const mockPresenter: LoginPresenter = mock<LoginPresenter>();
    const mockPresenterInstance: LoginPresenter = instance(mockPresenter);

    const alias = "@SomeAlias";
    const password = "myPassword";
    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElement("/", mockPresenterInstance);

    await user.type(aliasField, alias);
    await user.type(passwordField, password);

    await user.click(signInButton);

    verify(mockPresenter.doAuthentication(alias, password, anything())).once();
  });
});

const renderLogin = (originalUrl: string, presenter?: LoginPresenter) => {
  return render(
    <MemoryRouter>
      <Login
        originalUrl={originalUrl}
        presenterGenerator={(view: LoginView) =>
          presenter ?? new LoginPresenter(view)
        }
      />
    </MemoryRouter>
  );
};

const renderLoginAndGetElement = (
  originalUrl: string,
  presenter?: LoginPresenter
) => {
  const user = userEvent.setup();

  renderLogin(originalUrl, presenter);

  const signInButton = screen.getByRole("button", { name: /Sign in/i });
  const aliasField = screen.getByLabelText("alias");
  const passwordField = screen.getByLabelText("password");

  return { signInButton, aliasField, passwordField, user };
};

async function testSignInButtonActivation(
  user: UserEvent,
  aliasField: HTMLElement,
  passwordField: HTMLElement,
  signInButton: HTMLElement
) {
  await user.type(aliasField, "a");
  await user.type(passwordField, "b");

  expect(signInButton).toBeEnabled();
}
