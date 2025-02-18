import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { useNavigate } from "react-router-dom";
import { ChangeEvent } from "react";
import { Buffer } from "buffer";
import { Presenter, View } from "./Presenter";

export interface RegisterView extends View {
    firstName: string
    lastName: string
    alias: string
    password: string
    imageUrl: string
    imageBytes: Uint8Array
    imageFileExtension: string
    rememberMe: boolean
    setIsLoading: (isLoading: boolean) => void
    setImageUrl: (isImageUrl: string) => void
    setImageFileExtension: (isImageFileExtension: string) => void
    setImageBytes: (isImageBytes: Uint8Array) => void
    updateUserInfo: (currentUser: User, displayedUser: User | null, authToken: AuthToken, remember: boolean) => void
}

export class RegisterPresenter extends Presenter<RegisterView> {
    private userService: UserService;

    private navigate = useNavigate();

    public updateView(view: RegisterView){
        this.view = view;
    }

    public constructor(view: RegisterView){
        super(view);
        this.userService = new UserService;
    }

    public checkSubmitButtonStatus(): boolean {
        return (
          !this.view.firstName ||
          !this.view.lastName ||
          !this.view.alias ||
          !this.view.password ||
          !this.view.imageUrl ||
          !this.view.imageFileExtension
        );
      };
    
      public registerOnEnter(event: React.KeyboardEvent<HTMLElement>) {
        if (event.key == "Enter" && !this.checkSubmitButtonStatus()) {
          this.doRegister();
        }
      };

    public async doRegister() {
      this.doFailureReportingOperation(async () => {
        this.view.setIsLoading(true);
    
          const [user, authToken] = await this.userService.register(
            this.view.firstName,
            this.view.lastName,
            this.view.alias,
            this.view.password,
            this.view.imageBytes,
            this.view.imageFileExtension
          );
    
          this.view.updateUserInfo(user, user, authToken, this.view.rememberMe);
          this.navigate("/");
      }, "register user");
      this.view.setIsLoading(false);
    };

      public handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        this.handleImageFile(file);
      };
    
      public handleImageFile(file: File | undefined) {
        if (file) {
          this.view.setImageUrl(URL.createObjectURL(file));
    
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
    
            this.view.setImageBytes(bytes);
          };
          reader.readAsDataURL(file);
    
          // Set image file extension (and move to a separate method)
          const fileExtension = this.getFileExtension(file);
          if (fileExtension) {
            this.view.setImageFileExtension(fileExtension);
          }
        } else {
          this.view.setImageUrl("");
          this.view.setImageBytes(new Uint8Array());
        }
      };
    
      public getFileExtension(file: File): string | undefined {
        return file.name.split(".").pop();
      };
}