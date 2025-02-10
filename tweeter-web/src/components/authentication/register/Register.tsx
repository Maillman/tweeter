import "./Register.css";
import "bootstrap/dist/css/bootstrap.css";
import { ChangeEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import { Buffer } from "buffer";
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
    alias: alias,
    password: password,
    imageUrl: imageUrl,
    imageBytes: imageBytes,
    imageFileExtension: imageFileExtension,
    rememberMe: rememberMe,
    setIsLoading: setIsLoading,
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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleImageFile(file);
  };

  const handleImageFile = (file: File | undefined) => {
    if (file) {
      setImageUrl(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const imageStringBase64 = event.target?.result as string;

        // Remove unnecessary file metadata from the start of the string.
        const imageStringBase64BufferContents =
          imageStringBase64.split("base64,")[1];

        const bytes: Uint8Array = Buffer.from(
          imageStringBase64BufferContents,
          "base64"
        );

        setImageBytes(bytes);
      };
      reader.readAsDataURL(file);

      // Set image file extension (and move to a separate method)
      const fileExtension = getFileExtension(file);
      if (fileExtension) {
        setImageFileExtension(fileExtension);
      }
    } else {
      setImageUrl("");
      setImageBytes(new Uint8Array());
    }
  };

  const getFileExtension = (file: File): string | undefined => {
    return file.name.split(".").pop();
  };

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
              presenter.registerOnEnter(event)
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
              presenter.registerOnEnter(event)
            }
            onChange={(event) => setLastName(event.target.value)}
          />
          <label htmlFor="lastNameInput">Last Name</label>
        </div>
        <AuthenticationFields
          onKeyPress={(event: React.KeyboardEvent<HTMLElement>) =>
            presenter.registerOnEnter(event)
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
              presenter.registerOnEnter(event)
            }
            onChange={handleFileChange}
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
      submitButtonDisabled={() => presenter.checkSubmitButtonStatus()}
      isLoading={isLoading}
      submit={() => presenter.doRegister()}
    />
  );
};

export default Register;
