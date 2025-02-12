import useToastListener from "../toaster/ToastListenerHook";
import useUserInfo from "../userInfo/userInfoHook";
import { UserService } from "../../model/service/UserService";

const useNavigateToUser = () => {
    const { displayErrorMessage } = useToastListener();
    const { setDisplayedUser, currentUser, authToken } = useUserInfo();

    const userService = new UserService;
    
    const extractAlias = (value: string): string => {
        const index = value.indexOf("@");
        return value.substring(index);
    };

    //TODO: Should navigateToUser be moved to a presenter level?
    const navigateToUser = async (event: React.MouseEvent): Promise<void> => {


        event.preventDefault();

        try {
            const alias = extractAlias(event.target.toString());

            const user = await userService.getUser(authToken!, alias);

            if (!!user) {
            if (currentUser!.equals(user)) {
                setDisplayedUser(currentUser!);
            } else {
                setDisplayedUser(user);
            }
            }
        } catch (error) {
            displayErrorMessage(`Failed to get user because of exception: ${error}`);
        }
    
    }
    return navigateToUser;
};


export default useNavigateToUser;