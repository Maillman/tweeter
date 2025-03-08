import useToastListener from "../toaster/ToastListenerHook";
import useUserInfo from "../userInfo/userInfoHook";
import {
  UserNavigationPresenter,
  UserNavigationView,
} from "../../presenters/UserNavigationPresenter";
import { useEffect, useState } from "react";

const useNavigateToUser = () => {
  const { displayErrorMessage } = useToastListener();
  const { setDisplayedUser, currentUser, authToken } = useUserInfo();

  const extractAlias = (value: string): string => {
    const index = value.indexOf("@");
    return value.substring(index);
  };

  const listener: UserNavigationView = {
    extractAlias: extractAlias,
    setDisplayedUser: setDisplayedUser,
    displayErrorMessage: displayErrorMessage,
  };

  const [presenter] = useState(new UserNavigationPresenter(listener));
  const navigateToUser = (event: React.MouseEvent): void => {
    event.preventDefault();
    presenter.navigateToUser(event, authToken, currentUser);
  };
  return navigateToUser;
};

export default useNavigateToUser;
