export function mockDialog() {
  Object.defineProperty(globalThis.HTMLDialogElement.prototype, "showModal", {
    value: jest.fn().mockImplementation(function (this: HTMLDialogElement) {
      this.inert = false;
      this.open = true;
    }),
  });

  Object.defineProperty(globalThis.HTMLDialogElement.prototype, "close", {
    value: jest.fn().mockImplementation(function (this: HTMLDialogElement) {
      this.inert = true;
      this.open = false;
    }),
  });
}
