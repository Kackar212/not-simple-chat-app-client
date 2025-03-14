import { AnalyserNode } from "@/tests/jsdom/analyser-node.mock";
import { AudioContext } from "@/tests/jsdom/audio-context.mock";
import { MediaStream } from "@/tests/jsdom/media-stream.mock";
import { mockNavigatorMedia } from "@/tests/jsdom/navigator.mock";
import { mockMediaElement } from "@/tests/jsdom/media-element.mock";
import { mockDialog } from "@/tests/jsdom/dialog.mock";
import { server } from "./src/tests/server";
import "@testing-library/jest-dom";

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  globalThis.ResizeObserver = ResizeObserver as any;
  globalThis.AnalyserNode = AnalyserNode;
  globalThis.AudioContext = AudioContext;
  globalThis.MediaStream = MediaStream;

  mockNavigatorMedia();
  mockMediaElement();
  mockDialog();

  server.listen({ onUnhandledRequest() {} });
});

afterAll(() => server.close());

afterEach(() => {
  server.resetHandlers();
});
