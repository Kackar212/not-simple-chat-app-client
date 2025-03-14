export const AnalyserNode = jest.fn().mockImplementation(() => ({
  fftSize: 2048,
  frequencyBinCount: 1024,
  minDecibels: -90,
  maxDecibels: -10,
  smoothingTimeConstant: 0.8,
  getByteFrequencyData: jest.fn((array) => array.fill(128)),
  getFloatFrequencyData: jest.fn((array) => array.fill(-30)),
  getByteTimeDomainData: jest.fn((array) => array.fill(128)),
  getFloatTimeDomainData: jest.fn((array) => array.fill(0.5)),
  connect: jest.fn(),
  disconnect: jest.fn(),
}));
