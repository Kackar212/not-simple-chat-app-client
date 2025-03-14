export const AudioContext = jest.fn().mockImplementation(() => ({
  state: "running",
  sampleRate: 44100,
  destination: {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    channelCount: 2,
  },
  createGain: jest.fn().mockReturnValue({
    gain: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
  }),
  createOscillator: jest.fn().mockReturnValue({
    frequency: { setValueAtTime: jest.fn() },
    type: "sine",
    start: jest.fn(),
    stop: jest.fn(),
    connect: jest.fn(),
  }),
  createMediaStreamSource: jest.fn().mockReturnValue({
    connect: jest.fn(),
  }),
  createAnalyser: jest.fn().mockImplementation(function (this: AudioContext) {
    return new AnalyserNode(this);
  }),
  createBiquadFilter: jest.fn().mockReturnValue({
    type: "lowpass",
    frequency: { value: 1000 },
    connect: jest.fn(),
  }),
  resume: jest.fn().mockResolvedValue(undefined),
  suspend: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
}));
