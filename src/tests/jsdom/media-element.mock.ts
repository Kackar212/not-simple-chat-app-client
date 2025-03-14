export const playAudio = jest.fn();

export function mockMediaElement() {
  Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
    value: playAudio,
  });
}
