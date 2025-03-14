import { createProperties } from "@common/emojis/use-emoji-properties.hook";
import { createStyle } from "@common/emojis/use-emoji-style.hook";
import React, { PropsWithChildren } from "react";

export class ErrorBoundary extends React.Component<
  PropsWithChildren,
  { hasError: boolean }
> {
  constructor(props: Record<string, unknown>) {
    super(props);

    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {}

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={createProperties({ column: 2, size: 48 })}
        className="flex justify-center items-center flex-col size-full text-white-500"
      >
        <span
          style={createStyle("mask")}
          className="flex bg-gray-150 size-12"
        ></span>
        <h1 className="text-xl mt-4">Sorry, something went wrong!</h1>
        <p className="text-lg text-center w-full">
          Maybe our app is down or there is some problem with it, contact our
          admin at admin@admin.com
        </p>
      </div>
    );
  }
}
