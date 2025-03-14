import { render, waitFor } from "@/tests/test.utils";
import { RegisterForm } from "./register-form.component";
import userEvent, { UserEvent } from "@testing-library/user-event";

describe("RegisterForm", () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("should allow user to create new account if provided data is valid", async () => {
    const { getByLabelText, getByRole, getByText } = await render(
      <RegisterForm />
    );

    await user.type(getByLabelText(/Username/), "testuser");
    await user.type(getByLabelText(/Display name/), "test__user321");
    await user.type(getByLabelText(/Email/), "test@test.com");
    await user.type(getByLabelText(/Password/), "Abcd123!@#");

    await user.click(getByRole("button", { name: "Register" }));

    expect(
      getByText(/Your account has been created! Check your inbox!/)
    ).toBeInTheDocument();
  });

  it("should not allow user to create account if provided data is invalida", async () => {
    const { getByLabelText, getByRole, getByText, queryByText } = await render(
      <RegisterForm />
    );

    await user.type(getByLabelText(/Username/), "testuser!@#");
    await user.type(getByLabelText(/Display name/), "t");
    await user.type(getByLabelText(/Email/), "test");
    await user.type(getByLabelText(/Password/), "Abcd123!@");

    await user.click(getByRole("button", { name: "Register" }));

    expect(
      queryByText(/Your account has been created! Check your inbox!/)
    ).not.toBeInTheDocument();

    expect(
      getByText("must contain only numbers and english letters")
    ).toBeInTheDocument();
    expect(
      getByText("must contain at least 3 character(s)")
    ).toBeInTheDocument();
    expect(
      getByText("address is invalid, valid example: example@email.com")
    ).toBeInTheDocument();
    expect(
      getByText("must contain minimum 3 special characters")
    ).toBeInTheDocument();

    await user.type(getByLabelText(/Display name/), "x".repeat(28));

    expect(
      getByText("must contain at most 28 character(s)")
    ).toBeInTheDocument();
  });

  it("should display error message based on error code sent from server", async () => {
    const { getByLabelText, getByRole, getByText, queryByText } = await render(
      <RegisterForm />
    );

    await user.type(getByLabelText(/Username/), "AlreadyExists");
    await user.type(getByLabelText(/Display name/), "AlreadyExists");
    await user.type(getByLabelText(/Email/), "test@test.com");
    await user.type(getByLabelText(/Password/), "Abcd123!@#");

    await user.click(getByRole("button", { name: "Register" }));

    expect(
      getByText(/User with this email or username already exists!/i)
    ).toBeInTheDocument();
  });

  it("should inform user that he is being redirected if account has been created successfuly", async () => {
    const { getByLabelText, getByRole, getByText, queryByText } = await render(
      <RegisterForm />
    );

    await user.type(getByLabelText(/Username/), "TestUser");
    await user.type(getByLabelText(/Display name/), "TestUser");
    await user.type(getByLabelText(/Email/), "test@test.com");
    await user.type(getByLabelText(/Password/), "Abcd123!@#");

    await user.click(getByRole("button", { name: "Register" }));

    await waitFor(() => expect(getByText(/Redirecting/i)).toBeInTheDocument());
  });
});
