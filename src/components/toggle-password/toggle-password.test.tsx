import { render } from "@/tests/test.utils";
import { TogglePassword } from "./toggle-password.component";
import { useTogglePassword } from "./use-toggle-password.hook";
import userEvent, { UserEvent } from "@testing-library/user-event";

describe("TogglePassword", () => {
  let user: UserEvent;

  function TestComponent() {
    const { isHidden, setIsHidden } = useTogglePassword();

    return (
      <TogglePassword isHidden={isHidden} setIsHidden={setIsHidden} id="test" />
    );
  }

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("should change value of aria-label attribute when user clicks the button", async () => {
    const togglePassword = await render(<TestComponent />);

    const button = togglePassword.getByRole("button");

    expect(button).toHaveAttribute("aria-label", "Show password");

    await user.click(togglePassword.getByRole("button"));

    expect(togglePassword.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Hide password"
    );
  });

  it("should react to change of state by rendering different icon", async () => {
    const togglePassword = await render(<TestComponent />);
    const button = togglePassword.getByRole("button");

    expect(button.firstElementChild).toHaveAttribute("id", "eye-slash");

    await user.click(button);

    expect(button.firstElementChild).toHaveAttribute("id", "eye");
  });

  it("should announce the change of state to a screen reader user.", async () => {
    const togglePassword = await render(<TestComponent />);

    expect(
      togglePassword.getByText("your password is hidden")
    ).toBeInTheDocument();
    expect(togglePassword.getByText("your password is hidden")).toHaveAttribute(
      "aria-live",
      "polite"
    );

    await user.click(togglePassword.getByRole("button"));

    expect(
      togglePassword.queryByText("your password is hidden")
    ).not.toBeInTheDocument();
    expect(
      togglePassword.getByText("your password is shown")
    ).toBeInTheDocument();
    expect(togglePassword.getByText("your password is shown")).toHaveAttribute(
      "aria-live",
      "polite"
    );
  });
});
