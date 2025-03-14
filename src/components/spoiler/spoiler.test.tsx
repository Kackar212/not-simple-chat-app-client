import React from "react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { render } from "@/tests/test.utils";
import { Spoiler } from "./spoiler.component";

describe("Spoiler", () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("should be accessible", async () => {
    const spoiler = await render(<Spoiler>Hidden content</Spoiler>);

    const button = spoiler.getByRole("button");
    const hiddenContentSrOnly = spoiler.getByText(/Hidden content/, {
      selector: ".sr-only",
    });

    expect(spoiler.getByRole("group")).toHaveAttribute("aria-label", "Spoiler");
    expect(button).toHaveAttribute("aria-label", "Reveal spoiler");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("tabindex", "0");
    expect(hiddenContentSrOnly).toHaveAttribute("hidden");

    await user.tab();

    expect(button).toHaveFocus();

    await user.tab();

    expect(button).not.toHaveFocus();

    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(hiddenContentSrOnly).not.toHaveAttribute("hidden");
  });

  it("should render with content hidden", async () => {
    const spoiler = await render(<Spoiler>Hidden content</Spoiler>);

    const hiddenContent = spoiler.getByText(/Hidden content/, {
      selector: ":not(.sr-only)",
    });
    const hiddenContentSrOnly = spoiler.getByText(/Hidden content/, {
      selector: ".sr-only",
    });

    expect(hiddenContent).toHaveClass("opacity-0");
    expect(hiddenContent).toHaveAttribute("inert");

    expect(hiddenContentSrOnly).toHaveAttribute("hidden");
  });

  it("should reveal content after click if content is hidden", async () => {
    const spoiler = await render(<Spoiler>Hidden content</Spoiler>);

    const button = spoiler.getByRole("button");
    const hiddenContent = spoiler.getByText(/Hidden content/, {
      selector: ":not(.sr-only)",
    });
    const hiddenContentSrOnly = spoiler.getByText(/Hidden content/, {
      selector: ".sr-only",
    });

    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(hiddenContent).not.toHaveAttribute("inert");
    expect(hiddenContent).not.toHaveClass("opacity-0");
    expect(hiddenContentSrOnly).not.toHaveAttribute("hidden");
  });

  it("should hide content after click if content is revealed", async () => {
    const spoiler = await render(<Spoiler>Hidden content</Spoiler>);

    const button = spoiler.getByRole("button");
    const hiddenContent = spoiler.getByText(/Hidden content/, {
      selector: ":not(.sr-only)",
    });
    const hiddenContentSrOnly = spoiler.getByText(/Hidden content/, {
      selector: ".sr-only",
    });

    await user.click(button);
    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(hiddenContent).toHaveAttribute("inert");
    expect(hiddenContent).toHaveClass("opacity-0");
    expect(hiddenContentSrOnly).toHaveAttribute("hidden");
  });
});
