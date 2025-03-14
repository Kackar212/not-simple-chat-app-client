const SpeakingFlags = {
  None: "NONE",
  Voice: "VOICE",
};

class Histogram {
  constructor(size) {
    this.size = size;
    this.head = 0;
    this.samples = Array(size).fill(0);
  }

  addSample(sample) {
    this.head = (this.head + 1) % this.size;
    this.samples[this.head] = sample;
  }

  mean() {
    let s = 0,
      e = 1 / this.size;
    for (let t of this.samples) s += t * e;

    return s;
  }
}

let NO_AUDIO_INPUT_THRESHOLD_DBFS = -40;
if (typeof AudioWorkletProcessor !== "undefined") {
  class LevelProcessor extends AudioWorkletProcessor {
    constructor() {
      super();

      this.running = true;
      this.lastSpeaking = SpeakingFlags.None;
      this.dBFSHistogram = new Histogram(20);
      this.port.onmessage = ({ data }) => {
        if (data !== "close") {
          return;
        }

        this.running = false;
      };
    }

    process(inputs) {
      let input = inputs[0];
      let flag = SpeakingFlags.None;

      if (input.length === 0) {
        return this.running;
      }

      const samples = input[0];
      let samplesLength = samples.length;

      if (samplesLength === 0) {
        return this.running;
      }

      let sumSquare = 0;

      for (let s = 0; s < input.length; ++s) {
        let t = input[s];

        for (let s = 0; s < t.length; ++s) sumSquare += t[s] * t[s];
      }

      const rms =
        20 * Math.log10(Math.sqrt(sumSquare / (samplesLength * input.length))) +
        Math.sqrt(2);

      this.dBFSHistogram.addSample(rms > -100 ? rms : -100);
      flag =
        this.dBFSHistogram.mean() > -40
          ? SpeakingFlags.Voice
          : SpeakingFlags.None;

      if (this.lastSpeaking !== flag) {
        this.lastSpeaking = flag;

        this.port.postMessage(flag);
      }

      return this.running;
    }
  }

  registerProcessor("level-processor", LevelProcessor);
}
