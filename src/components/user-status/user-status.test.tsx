import userEvent from "@testing-library/user-event";
import { UserStatus } from "./user-status.component";
import { ActivityStatus } from "@common/enums/activity-status.enum";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@/tests/test.utils";
import { AvatarSize } from "@common/constants";

describe("UserStatus", () => {
  it("should return jsx element if hidden is false", async () => {
    const userStatus = await render(
      <UserStatus hidden={false} status={ActivityStatus.Online} size={16} />
    );

    expect(userStatus.getByText(/User is online/)).toBeInTheDocument();
  });

  it("should return null if hidden is true", async () => {
    const userStatus = await render(
      <UserStatus hidden={true} status={ActivityStatus.Online} size={16} />
    );

    expect(userStatus.queryByText(/User is online/)).not.toBeInTheDocument();
  });

  it("should be rendered with green color if user is online", async () => {
    const userStatus = await render(
      <UserStatus hidden={false} status={ActivityStatus.Online} size={16} />
    );

    expect(userStatus.baseElement.querySelector("span > span")).toHaveClass(
      "bg-green-500"
    );
  });

  it("should be rendered with gray color if user is offline", async () => {
    const userStatus = await render(
      <UserStatus status={ActivityStatus.Offline} size={16} />
    );

    expect(userStatus.baseElement.querySelector("span > span")).toHaveClass(
      "bg-gray-200"
    );
  });

  it("should show tooltip when user moves mouse over it and hides it when mouse is moved elsewhere", async () => {
    const user = userEvent.setup();

    const userStatus = await render(
      <UserStatus status={ActivityStatus.Offline} size={16} />
    );
    const baseElement = userStatus.getByText(/User is offline/);

    await user.hover(baseElement);

    await waitFor(() =>
      expect(screen.queryByText(/Offline/)).toBeInTheDocument()
    );

    await user.unhover(baseElement);

    await waitForElementToBeRemoved(() => screen.queryByText(/Offline/));

    expect(screen.queryByText(/Offline/));
  });
});
