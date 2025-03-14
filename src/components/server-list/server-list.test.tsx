import {
  findByText,
  getByAltText,
  getByRole,
  render,
  waitFor,
  waitForElementToBeRemoved,
} from "@/tests/test.utils";
import { ServerList } from "./server-list.component";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { location } from "@/tests/app-router-provider.mock";

describe("ServerList", () => {
  let user: UserEvent;
  beforeEach(() => {
    user = userEvent.setup();
  });

  it("should render requested servers in list", async () => {
    const { getByText, queryByAltText, queryByText } = await render(
      <ServerList />,
      {
        wrapperProps: {
          pathname: "/channels/1/1",
          params: { serverId: "1", channelId: "1" },
        },
      }
    );

    await waitFor(() => {
      return expect(
        queryByAltText(/Go to server test 1 server/i)
      ).toBeInTheDocument();
    });

    expect(getByText(/Go to server test 1 server/i)).toBeInTheDocument();
    expect(getByText(/Go to server test 2 server/i)).toBeInTheDocument();
  });

  it("should show tooltip when user moves mouse over element in list", async () => {
    const { getByText, queryByAltText, queryByText } = await render(
      <ServerList />,
      {
        wrapperProps: {
          pathname: "/channels/1/1",
          params: { serverId: "1", channelId: "1" },
        },
      }
    );

    await waitFor(() => {
      return expect(
        queryByAltText(/Go to server test 1 server/i)
      ).toBeInTheDocument();
    });

    await user.hover(getByText(/Go to server test 1 server/i));

    expect(getByText(/^server test 1/i)).toBeInTheDocument();
  });

  it("should render list items with correct href, ie. https://localhost:3000/channels/[serverId]/[channelId] where `channelId` is optional", async () => {
    const { getAllByRole, queryByAltText, queryByText } = await render(
      <ServerList />,
      {
        wrapperProps: {
          pathname: "/channels/me/friends",
        },
      }
    );

    await waitFor(() => {
      return expect(
        queryByAltText(/Go to server test 1 server/i)
      ).toBeInTheDocument();
    });

    expect(
      getAllByRole("link", { current: false }).map((link) =>
        link.getAttribute("href")
      )
    ).toEqual([
      "https://localhost:3000/channels/1/1",
      "https://localhost:3000/channels/2/2",
      "https://localhost:3000/channels/3",
    ]);
  });
});
