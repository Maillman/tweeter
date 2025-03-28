import "./Register.css";
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import useToastListener from "../../toaster/ToastListenerHook";
import AuthenticationFields from "../AuthenticationFields";
import useUserInfo from "../../userInfo/userInfoHook";
import {
  RegisterPresenter,
  RegisterView,
} from "../../../presenters/RegisterPresenter";

interface Props {
  presenterGenerator: (view: RegisterView) => RegisterPresenter;
}

const Register = (props: Props) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [imageBytes, setImageBytes] = useState<Uint8Array>(new Uint8Array());
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFileExtension, setImageFileExtension] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { updateUserInfo } = useUserInfo();
  const { displayErrorMessage } = useToastListener();

  const listener: RegisterView = {
    firstName: firstName,
    lastName: lastName,
    imageUrl: imageUrl,
    imageBytes: imageBytes,
    imageFileExtension: imageFileExtension,
    setIsLoading: setIsLoading,
    setImageUrl: setImageUrl,
    setImageFileExtension: setImageFileExtension,
    setImageBytes: setImageBytes,
    updateUserInfo: updateUserInfo,
    displayErrorMessage: displayErrorMessage,
  };

  const [presenter] = useState(props.presenterGenerator(listener));

  useEffect(() => {
    presenter.updateView(listener);
  }, [
    firstName,
    lastName,
    alias,
    password,
    rememberMe,
    imageUrl,
    imageBytes,
    imageFileExtension,
  ]);

  const inputFieldGenerator = () => {
    return (
      <>
        <div className="form-floating">
          <input
            type="text"
            className="form-control"
            size={50}
            id="firstNameInput"
            placeholder="First Name"
            onKeyDown={(event: React.KeyboardEvent<HTMLElement>) =>
              presenter.authenticateOnEnter(event, alias, password, rememberMe)
            }
            onChange={(event) => setFirstName(event.target.value)}
          />
          <label htmlFor="firstNameInput">First Name</label>
        </div>
        <div className="form-floating">
          <input
            type="text"
            className="form-control"
            size={50}
            id="lastNameInput"
            placeholder="Last Name"
            onKeyDown={(event: React.KeyboardEvent<HTMLElement>) =>
              presenter.authenticateOnEnter(event, alias, password, rememberMe)
            }
            onChange={(event) => setLastName(event.target.value)}
          />
          <label htmlFor="lastNameInput">Last Name</label>
        </div>
        <AuthenticationFields
          onKeyPress={(event: React.KeyboardEvent<HTMLElement>) =>
            presenter.authenticateOnEnter(event, alias, password, rememberMe)
          }
          alias={alias}
          setAlias={setAlias}
          password={password}
          setPassword={setPassword}
        />
        <div className="form-floating mb-3">
          <input
            type="file"
            className="d-inline-block py-5 px-4 form-control bottom"
            id="imageFileInput"
            onKeyDown={(event: React.KeyboardEvent<HTMLElement>) =>
              presenter.authenticateOnEnter(event, alias, password, rememberMe)
            }
            onChange={presenter.handleFileChange}
          />
          <label htmlFor="imageFileInput">User Image</label>
          <img src={imageUrl} className="img-thumbnail" alt=""></img>
        </div>
      </>
    );
  };

  const switchAuthenticationMethodGenerator = () => {
    return (
      <div className="mb-3">
        Algready registered? <Link to="/login">Sign in</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Register"
      submitButtonLabel="Register"
      oAuthHeading="Register with:"
      inputFieldGenerator={inputFieldGenerator}
      switchAuthenticationMethodGenerator={switchAuthenticationMethodGenerator}
      setRememberMe={setRememberMe}
      submitButtonDisabled={() =>
        presenter.checkSubmitButtonStatus(alias, password)
      }
      isLoading={isLoading}
      submit={() => presenter.doAuthentication(alias, password, rememberMe)}
    />
  );
};

export default Register;
