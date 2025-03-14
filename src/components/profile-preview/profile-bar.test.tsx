import { render, waitFor } from "@/tests/test.utils";
import { ProfileBar } from "./profile-bar.component";
import { playAudio } from "@/tests/jsdom/media-element.mock";
import { getUserMedia } from "@/tests/jsdom/navigator.mock";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { createServerEntityMock } from "@/tests/server/entities";

describe("ProfileBar", () => {
  let user: UserEvent;

  beforeAll(() => {});

  beforeEach(() => {
    user = userEvent.setup();

    playAudio.mockClear();
    getUserMedia.mockClear();
  });

  it("should allow user to mute/unmute his input/output device", async () => {
    const { getByRole, queryByRole } = await render(<ProfileBar />);

    const muteInputDevice = queryByRole("button", {
      name: "Mute microphone svgrurl",
    });

    const unmuteOutputDevice = queryByRole("button", {
      name: "Undeafen svgrurl",
    });

    expect(muteInputDevice).not.toBeInTheDocument();
    expect(unmuteOutputDevice).not.toBeInTheDocument();

    await user.click(
      getByRole("button", {
        name: "Unmute microphone svgrurl",
      })
    );

    expect(getUserMedia).toHaveBeenCalled();
    expect(playAudio).toHaveBeenCalledTimes(1);

    await user.click(
      getByRole("button", {
        name: "Deafen svgrurl",
      })
    );

    expect(playAudio).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(
        getByRole("button", {
          name: "Mute microphone svgrurl",
        })
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      return expect(
        getByRole("button", {
          name: "Undeafen svgrurl",
        })
      ).toBeInTheDocument();
    });

    await user.click(
      getByRole("button", {
        name: "Mute microphone svgrurl",
      })
    );

    expect(playAudio).toHaveBeenCalledTimes(3);

    await user.click(
      getByRole("button", {
        name: "Undeafen svgrurl",
      })
    );

    expect(playAudio).toHaveBeenCalledTimes(4);

    expect(
      getByRole("button", {
        name: "Unmute microphone svgrurl",
      })
    ).toBeInTheDocument();

    expect(
      getByRole("button", {
        name: "Deafen svgrurl",
      })
    ).toBeInTheDocument();
  });

  it("should allow user to see they profile preview", async () => {
    const { getByRole, getByText, queryByRole } = await render(<ProfileBar />);

    await user.click(
      getByRole("button", { name: "Open your profile preview" })
    );

    expect(
      getByRole("region", { name: "Your profile preview" })
    ).toBeInTheDocument();
    expect(getByRole("heading", { name: "Member since" })).toBeInTheDocument();
    expect(getByRole("link", { name: "svgrurlLogout" })).toBeInTheDocument();
  });

  it("should allow user to leave server if user is not a owner", async () => {
    const { getByRole, getByText, queryByRole, container } = await render(
      <ProfileBar server={createServerEntityMock(1, 1)} />,
      {
        wrapperProps: {
          pathname: "/channels/1/1",
          params: { serverId: "1", channelId: "1" },
        },
      }
    );

    await user.click(
      getByRole("button", { name: "Open your profile preview" })
    );

    await user.click(
      getByRole("button", { name: "svgrurl Leave server test 1 server" })
    );
    await waitFor(() =>
      expect(
        getByRole("alertdialog", { name: "Confirmation" })
      ).toBeInTheDocument()
    );

    await user.click(getByRole("button", { name: "No" }));

    expect(
      queryByRole("alertdialog", { name: "Confirmation" })
    ).not.toBeInTheDocument();

    await user.click(
      getByRole("button", { name: "svgrurl Leave server test 1 server" })
    );

    await user.click(getByRole("button", { name: "Yes" }));

    getByRole("status", { name: "You left server test 1 server" });
  });

  it("should allow user to delete server if user is owner", async () => {
    const { getByRole, getByText, queryByRole } = await render(
      <ProfileBar server={createServerEntityMock(2, 2)} />,
      {
        wrapperProps: {
          pathname: "/channels/2/2",
          params: { serverId: "2", channelId: "2" },
        },
      }
    );

    await user.click(
      getByRole("button", { name: "Open your profile preview" })
    );

    user.click(
      getByRole("button", { name: "svgrurl Delete server test 2 server" })
    );
  });
});
