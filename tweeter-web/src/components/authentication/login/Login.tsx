import "./Login.css";
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import useToastListener from "../../toaster/ToastListenerHook";
import AuthenticationFields from "../AuthenticationFields";
import useUserInfo from "../../userInfo/userInfoHook";
import { LoginPresenter, LoginView } from "../../../presenters/LoginPresenter";

interface Props {
  originalUrl?: string;
  presenterGenerator: (view: LoginView) => LoginPresenter;
}

const Login = (props: Props) => {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { updateUserInfo } = useUserInfo();
  const { displayErrorMessage } = useToastListener();

  const listener: LoginView = {
    originalUrl: props.originalUrl,
    alias: alias,
    password: password,
    rememberMe: rememberMe,
    setIsLoading: setIsLoading,
    updateUserInfo: updateUserInfo,
    displayErrorMessage: displayErrorMessage,
  };

  const [presenter] = useState(props.presenterGenerator(listener));

  useEffect(() => {
    presenter.updateView(listener);
  }, [props.originalUrl, alias, password, rememberMe]);

  const inputFieldGenerator = () => {
    return (
      <AuthenticationFields
        onKeyPress={(event: React.KeyboardEvent<HTMLElement>) =>
          presenter.loginOnEnter(event)
        }
        alias={alias}
        setAlias={setAlias}
        password={password}
        setPassword={setPassword}
      />
    );
  };

  const switchAuthenticationMethodGenerator = () => {
    return (
      <div className="mb-3">
        Not registered? <Link to="/register">Register</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Sign In"
      submitButtonLabel="Sign in"
      oAuthHeading="Sign in with:"
      inputFieldGenerator={inputFieldGenerator}
      switchAuthenticationMethodGenerator={switchAuthenticationMethodGenerator}
      setRememberMe={setRememberMe}
      submitButtonDisabled={() => presenter.checkSubmitButtonStatus()}
      isLoading={isLoading}
      submit={() => presenter.doLogin()}
    />
  );
};

export default Login;
