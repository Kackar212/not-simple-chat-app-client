export const getUserMedia = jest.fn().mockImplementation(() => {
  return Promise.resolve(new MediaStream());
});

export function mockNavigatorMedia() {
  Object.defineProperty(window.navigator, "permissions", {
    configurable: true,
    value: {
      query: jest.fn().mockImplementation(() => {
        return Promise.resolve({ state: "granted" });
      }),
    },
  });

  Object.defineProperty(window.navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia,
    },
  });
}
