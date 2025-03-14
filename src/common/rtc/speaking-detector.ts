import { Microphone } from "@common/hooks/use-microphone/microphone.interface";

interface SpeakingDetectorProps {
  audioContext: AudioContext;
  stream: MediaStream;
  threshold?: number;
  smoothingConstant?: number;
  historyLength?: number;
  microphone: Microphone;
  onProcess: (volume: number, isSpeaking: boolean) => void;
}

export class SpeakingDetector {
  threshold: number = -40;
  #currentVolume = 0;
  analyser: AnalyserNode;
  interval: number = -1;
  fftBins: Float32Array = new Float32Array();
  source: MediaStreamAudioSourceNode;
  microphone: Microphone;
  speakingHistory: boolean[] = [];
  speakingHistoryIndex = 0;
  speakingCounter = 0;
  silenceThreshold: number = -1;
  silentFrames: number = 0;
  onProcess: (volume: number, isSpeaking: boolean) => void = () => {};

  constructor({
    audioContext,
    stream,
    microphone,
    smoothingConstant = 0.8,
    historyLength = 10,
    threshold = -40,
    onProcess = () => {},
  }: SpeakingDetectorProps) {
    this.microphone = microphone;

    const analyser = new AnalyserNode(audioContext);
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = smoothingConstant;

    const streamSource = audioContext.createMediaStreamSource(stream);
    streamSource.connect(analyser);

    this.speakingHistory = Array.from({ length: historyLength }, () => false);

    this.threshold = threshold;
    this.analyser = analyser;
    this.onProcess = onProcess;
    this.fftBins = new Float32Array(analyser.fftSize);
    this.source = streamSource;
    this.silenceThreshold = this.speakingHistory.length;
    this.silentFrames = this.silenceThreshold;

    this.loop();
  }

  get currentVolume() {
    let volume = -Infinity;

    this.analyser.getFloatFrequencyData(this.fftBins);

    for (let e = 4; e < this.fftBins.length; e++) {
      if (this.fftBins[e] > volume && this.fftBins[e] < 0) {
        volume = this.fftBins[e];
      }
    }

    return volume;
  }

  detect() {
    if (this.speakingHistory[this.speakingHistoryIndex]) {
      this.speakingCounter--;
    }

    const isVolumeOverThreshold = this.currentVolume > this.threshold;
    this.speakingHistory[this.speakingHistoryIndex] = isVolumeOverThreshold;

    if (isVolumeOverThreshold) {
      this.speakingCounter++;
    }

    this.speakingHistoryIndex += 1;

    if (this.speakingHistoryIndex === this.speakingHistory.length) {
      this.speakingHistoryIndex = 0;
    }

    if (this.speakingCounter > 0) {
      this.silentFrames = 0;

      return;
    }

    this.silentFrames++;
  }

  loop(isSpeaking?: boolean) {
    let isUserSpeaking = isSpeaking;

    this.interval = window.setTimeout(() => {
      if (this.microphone.isMuted) {
        return;
      }

      this.detect();

      if (
        typeof isUserSpeaking === "undefined" ||
        isUserSpeaking !== this.isUserSpeaking
      ) {
        isUserSpeaking = this.isUserSpeaking;

        this.onProcess(this.currentVolume, this.isUserSpeaking);
      }

      this.loop(isUserSpeaking);
    }, 4);
  }

  stop() {
    this.source.disconnect();

    clearInterval(this.interval);

    this.speakingCounter = 0;
  }

  get isUserSpeaking() {
    return (
      this.speakingCounter > 0 || this.silentFrames < this.silenceThreshold
    );
  }
}
