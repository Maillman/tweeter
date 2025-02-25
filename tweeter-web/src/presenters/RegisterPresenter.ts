import { ChangeEvent } from "react";
import { Buffer } from "buffer";
import { AuthPresenter, AuthView } from "./AuthPresenter";

export interface RegisterView extends AuthView {
    firstName: string
    lastName: string
    imageUrl: string
    imageBytes: Uint8Array
    imageFileExtension: string
    setImageUrl: (isImageUrl: string) => void
    setImageFileExtension: (isImageFileExtension: string) => void
    setImageBytes: (isImageBytes: Uint8Array) => void
}

export class RegisterPresenter extends AuthPresenter<RegisterView> {
    public checkSubmitButtonStatus(alias: string, password: string): boolean {
        return (
          !this.view.firstName ||
          !this.view.lastName ||
          !alias ||
          !password ||
          !this.view.imageUrl ||
          !this.view.imageFileExtension
        );
      };
    public doAuthentication(alias: string, password: string, rememberMe: boolean): Promise<void> {
      return this.doAuthenticationOperation(async () => {
        return await this.userService.register(
          this.view.firstName,
          this.view.lastName,
          alias,
          password,
          this.view.imageBytes,
          this.view.imageFileExtension
        );
      }, "register user", rememberMe);
    }
    protected doNavigation(): void {
      this.navigate("/");
    }

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