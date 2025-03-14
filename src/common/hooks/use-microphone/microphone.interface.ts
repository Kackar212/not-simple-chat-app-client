import { SpeakingDetector } from "@common/rtc/speaking-detector";

export interface Microphone {
  isMuted: boolean;
  stream: MediaStream | null;
  audioContext: AudioContext | null;
  isSpeaking: boolean;
  isMicrophoneRequested: boolean;
  gainNode: GainNode | null;
  streamClone: MediaStream | null;
  speakingDetector: SpeakingDetector | null;
  get: () => Promise<MediaStream>;
  stop: () => Promise<void>;
  mute: () => Promise<boolean>;
  unmute: () => Promise<boolean>;
  toggleMutedState: (force?: boolean) => Promise<boolean>;
}
