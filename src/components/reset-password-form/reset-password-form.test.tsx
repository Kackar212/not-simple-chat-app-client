import { render, waitFor } from "@/tests/test.utils";
import { ResetPasswordForm } from "./reset-password-form.component";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { AuthAction } from "@common/auth/auth-action.enum";

describe("ResetPasswordForm", () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("should allow user to reset password using reset password token", async () => {
    const { getByRole, getByLabelText, getByText, queryByText } = await render(
      <ResetPasswordForm resetPasswordToken="reset_password_token_test" />
    );

    await user.type(getByLabelText("New password"), "Abcd123!@#");
    await user.type(getByLabelText("Confirm new password"), "Abcd123!@#");

    await user.click(getByRole("button", { name: "Reset password" }));

    await waitFor(() =>
      expect(getByText(/Your password has been reset!/)).toBeInTheDocument()
    );
  });

  it("should allow user to reset password when user is logged in and isOldPasswordRequired is set to true", async () => {
    const { getByRole, getByLabelText, getByText, queryByText, baseElement } =
      await render(<ResetPasswordForm isOldPasswordRequired={true} />);

    await user.type(getByLabelText("Old password"), "Abcd1234!@#");
    await user.type(getByLabelText("New password"), "Abcd123!@#");
    await user.type(getByLabelText("Confirm new password"), "Abcd123!@#");

    await user.click(getByRole("button", { name: "Reset password" }));

    await waitFor(() =>
      expect(getByText(/Your password has been reset!/)).toBeInTheDocument()
    );
  });

  it("should not allow user to reset password if provided values are invalid", async () => {
    const { getByRole, getByLabelText, getByText, queryByText } = await render(
      <ResetPasswordForm isOldPasswordRequired={true} />
    );

    await user.type(getByLabelText("Old password"), "abcd123!@#");
    await user.type(getByLabelText("New password"), "Abcd!@#");
    await user.type(getByLabelText("Confirm new password"), "Abcde123");

    await user.click(getByRole("button", { name: "Reset password" }));

    expect(
      queryByText(/Your password has been reset!/)
    ).not.toBeInTheDocument();
    expect(
      getByText("must contain at least one uppercase letter")
    ).toBeInTheDocument();
    expect(
      getByText("must contain at least 8 character(s)")
    ).toBeInTheDocument();
    expect(
      getByText("must contain minimum 3 special characters")
    ).toBeInTheDocument();

    const input = getByLabelText("Old password");

    await user.type(input, "ABCD!@#123", {
      initialSelectionStart: 0,
      initialSelectionEnd: 10,
    });

    await user.type(getByLabelText("New password"), "Abcdxyz!@#");

    await user.click(getByRole("button", { name: "Reset password" }));

    expect(
      queryByText(/Your password has been reset!/)
    ).not.toBeInTheDocument();

    expect(
      getByText("must contain at least one lowercase letter")
    ).toBeInTheDocument();
    expect(getByText("must contain at least one digit")).toBeInTheDocument();
  });

  it("should display error message if server returns OLD_PASSWORD_INCORRECT error", async () => {
    const { getByRole, getByLabelText, getByText } = await render(
      <ResetPasswordForm isOldPasswordRequired={true} />
    );

    await user.type(getByLabelText("Old password"), "Testerror1!@#");
    await user.type(getByLabelText("New password"), "Abcd123!@#");
    await user.type(getByLabelText("Confirm new password"), "Abcd123!@#");

    await user.click(getByRole("button", { name: "Reset password" }));

    expect(getByText(/Old password is incorrect/i)).toBeInTheDocument();
  });

  it("should display error message if server returns NOT_FOUND error", async () => {
    const { getByRole, getByLabelText, getByText } = await render(
      <ResetPasswordForm resetPasswordToken="reset_password_token_not_found" />
    );

    await user.type(getByLabelText("New password"), "Abcd123!@#");
    await user.type(getByLabelText("Confirm new password"), "Abcd123!@#");

    await user.click(getByRole("button", { name: "Reset password" }));

    expect(getByText(/Link expired or is invalid/i)).toBeInTheDocument();
  });

  it("should render information about invalid link if link is missing or invalid", async () => {
    function Logout() {
      const { dispatch } = useSafeContext(authContext);

      return (
        <button onClick={() => dispatch({ type: AuthAction.SignOut })}>
          Logout
        </button>
      );
    }

    const { getByText, getByRole } = await render(
      <>
        <ResetPasswordForm isOldPasswordRequired={true} />
        <Logout />
      </>
    );

    await user.click(getByRole("button", { name: "Logout" }));

    expect(
      getByText(
        /Link is invalid, check if link is matching the one sent to you, if it does then you can/i
      )
    ).toBeInTheDocument();
  });
});
