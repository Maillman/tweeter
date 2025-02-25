import { AuthToken, User } from "tweeter-shared";
import { PostStatusPresenter, PostStatusView } from "../../src/presenters/PostStatusPresenter";
import { anything, capture, instance, mock, spy, verify, when } from "@typestrong/ts-mockito";
import { StatusService } from "../../src/model/service/StatusService";

describe("PostStatusPresenter", () => {
    let mockPostStatusView: PostStatusView;
    let postStatusPresenter: PostStatusPresenter;
    let mockStatusService: StatusService;
    
    const event = anything();
    event.preventDefault = jest.fn();
    const post = "feeling good";
    const user = new User("john", "doe", "jd128", "newImage.com/checkThisImageOut");
    const authToken = new AuthToken("abc123", Date.now());

    beforeEach(() => {
        mockPostStatusView = mock<PostStatusView>();
        const mockPostStatusViewInstance = instance(mockPostStatusView);

        const postStatusPresenterSpy = spy(new PostStatusPresenter(mockPostStatusViewInstance));
        postStatusPresenter = instance(postStatusPresenterSpy);

        mockStatusService = mock<StatusService>();
        const mockStatusServiceInstance = instance(mockStatusService);

        when(postStatusPresenterSpy.statusService).thenReturn(mockStatusServiceInstance);
    });

    it("tells the view to display a posting status message", async () => {
        await postStatusPresenter.submitPost(event, post, user, authToken);

        // const [capturedInfoMessage] = capture(mockPostStatusView.displayInfoMessage).last();
        // console.log(capturedInfoMessage);

        verify(mockPostStatusView.displayInfoMessage("Posting status...", 0)).once();
    });

    it("calls postStatus on the post status service with the correct status string and auth token", async () => {
        await postStatusPresenter.submitPost(event, post, user, authToken);
        const [, status] = capture(mockStatusService.postStatus).last();
        verify(mockStatusService.postStatus(authToken, status)).once();
    });

    it("tells the view to clear the last info message, clear the post, and display a status posted message when successful", async () => {
        await postStatusPresenter.submitPost(event, post, user, authToken);

        verify(mockPostStatusView.displayErrorMessage(anything())).never();
        verify(mockPostStatusView.displayInfoMessage("Status posted!", 2000)).once();

        verify(mockPostStatusView.clearLastInfoMessage()).once();
        verify(mockPostStatusView.setPost("")).once();
    });

    it("tells the view to display an error message and clear the last info message and does not tell it to clear the post or display a status posted message when fails", async () => {
        const error = new Error("Could not post the status");
        when(mockStatusService.postStatus(authToken, anything())).thenThrow(error);

        await postStatusPresenter.submitPost(event, post, user, authToken);

        verify(mockPostStatusView.displayErrorMessage("Failed to post the status because of exception: Could not post the status")).once();
        verify(mockPostStatusView.clearLastInfoMessage()).once();

        verify(mockPostStatusView.displayInfoMessage("Status posted!", 2000)).never();
        verify(mockPostStatusView.setPost("")).never();
    });
});