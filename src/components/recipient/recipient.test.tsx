import { render } from "@/tests/test.utils";
import { Recipient } from "./recipient.component";
import { createRecipientEntityMock, user } from "@/tests/server/entities";
import { QueryKey } from "@common/constants";
import userEvent, { UserEvent } from "@testing-library/user-event";

describe("Recipient", () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  const recipient = createRecipientEntityMock();

  it("should render recipient names, mutual data and buttons that will allow user to block recipient or send him friend request", async () => {
    const { getAllByText, getByText, getByRole } = await render(
      <Recipient recipient={recipient} isBlocked={false} queryKey={[]} />
    );

    expect(getAllByText(/^Recipient$/i)).toHaveLength(2);
    expect(getByText(/^Recipient display name$/i)).toBeInTheDocument();
    expect(getByText(/2 mutual servers/i)).toBeInTheDocument();
    expect(getByText(/1 mutual friends/i)).toBeInTheDocument();
    expect(getByRole("button", { name: "Add friend" })).toBeInTheDocument();
    expect(
      getByRole("button", { name: `Block ${recipient.username}` })
    ).toBeInTheDocument();
  });

  it("should not render add friend button if user is blocked and should change label of  block/unblock button", async () => {
    const { getAllByText, getByText, queryByRole, getByRole } = await render(
      <Recipient recipient={recipient} isBlocked={true} queryKey={[]} />
    );

    expect(getAllByText(/^Recipient$/i)).toHaveLength(2);
    expect(getByText(/^Recipient display name$/i)).toBeInTheDocument();
    expect(getByText(/2 mutual servers/i)).toBeInTheDocument();
    expect(getByText(/1 mutual friends/i)).toBeInTheDocument();
    expect(
      queryByRole("button", { name: "Add friend" })
    ).not.toBeInTheDocument();
    expect(
      getByRole("button", { name: `Unblock ${recipient.username}` })
    ).toBeInTheDocument();
  });
});
