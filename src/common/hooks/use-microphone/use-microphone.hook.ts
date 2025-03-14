import { useRef } from "react";
import {
  createAudioContext,
  disableTracks,
  getLocalAudioStream,
  localAudioPromise,
} from "./use-microphone.helpers";
import { Microphone } from "./microphone.interface";
import { useSafeContext } from "../use-safe-context.hook";
import { authContext } from "@common/auth/auth.context";
import { SpeakingDetector } from "@common/rtc/speaking-detector";

interface UseMicrophoneProps {
  gain?: number;
  constraints?: MediaStreamConstraints;
}

export function useMicrophone({
  gain = 0.6,
  constraints = {
    audio: { noiseSuppression: true },
    video: false,
  },
}: UseMicrophoneProps) {
  const {
    auth: { user },
  } = useSafeContext(authContext);

  const { current: microphone } = useRef<Microphone>({
    isMuted: typeof user.isSelfMuted === "undefined" ? true : user.isSelfMuted,
    stream: null,
    audioContext: null,
    isSpeaking: false,
    isMicrophoneRequested: false,
    gainNode: null,
    streamClone: null,
    speakingDetector: null,
    async get() {
      if (localAudioPromise) {
        return await localAudioPromise;
      }

      if (this.stream) {
        return this.stream;
      }

      this.stream = await getLocalAudioStream(constraints);

      this.audioContext = createAudioContext();

      this.streamClone = this.stream.clone();

      if (this.speakingDetector) {
        this.speakingDetector.stop();
      }

      this.speakingDetector = new SpeakingDetector({
        audioContext: this.audioContext,
        stream: this.streamClone,
        microphone: this,
        onProcess(_volume, isSpeaking) {
          document.dispatchEvent(
            new CustomEvent("voiceactivation", {
              detail: {
                isSpeaking,
                remote: false,
                username: user.username,
              },
            })
          );
        },
      });

      return this.stream;
    },
    async stop() {
      if (localAudioPromise) {
        await localAudioPromise;
      }

      if (!this.stream) {
        return;
      }

      this.stream.getAudioTracks().forEach((track) => track.stop());
      this.streamClone?.getAudioTracks().forEach((track) => track.stop());

      await this.audioContext?.close();

      this.stream = null;
      this.streamClone = null;
    },
    async mute() {
      const stream = await localAudioPromise;

      if (stream) {
        disableTracks(stream);
      }

      if (this.isMuted) {
        return true;
      }

      this.isMuted = true;

      if (!this.stream) {
        return true;
      }

      return true;
    },
    async unmute() {
      if (!this.isMuted) {
        return false;
      }

      this.isMuted = false;

      if (this.stream) {
        return false;
      }

      try {
        await this.get();
        await this.stop();

        return false;
      } catch (e) {
        this.isMuted = true;

        throw e;
      }
    },
    async toggleMutedState(force?: boolean) {
      if (force === true) {
        return this.mute();
      }

      if (force === false) {
        return this.unmute();
      }

      if (this.isMuted) {
        return this.unmute();
      }

      return this.mute();
    },
  });

  return microphone;
}
