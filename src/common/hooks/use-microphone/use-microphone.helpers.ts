import { mediasoupStorage } from "@common/rtc/mediasoup";
import { Microphone } from "./microphone.interface";

export let localAudioPromise: Promise<MediaStream> | undefined;
export function getLocalAudioStream(
  constraints: MediaStreamConstraints,
  guard = true
) {
  if (localAudioPromise && guard) {
    return localAudioPromise;
  }

  const streamPromise = window.navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      localAudioPromise = undefined;

      return stream;
    });

  if (!guard) {
    return streamPromise;
  }

  return (localAudioPromise = streamPromise);
}

export const createAudioContext = () => {
  const audioContext = new AudioContext();

  return audioContext;
};

export const createStreamSource = (
  audioContext: AudioContext,
  stream: MediaStream
) => {
  return audioContext.createMediaStreamSource(stream);
};

export function getVolume(event: MessageEvent<{ volume: number }>) {
  const sensibility = 5;
  const { volume } = event.data;

  if (!volume) {
    return volume;
  }

  return (volume * 100) / sensibility;
}

export const createGainNode = (audioContext: AudioContext) => {
  const gainNode = audioContext.createGain();

  document.addEventListener("audio_volume", ({ detail }) => {
    gainNode.gain.value = detail.audioVolume;
  });

  return gainNode;
};

export const disableTracks = (stream: MediaStream) => {
  mediasoupStorage.producer?.pause();
};

export const createAudioWorklet = async (
  audioContext: AudioContext,
  streamSource: MediaStreamAudioSourceNode
) => {
  await audioContext.audioWorklet.addModule("/microphone-level-processor.js");

  const node = new AudioWorkletNode(audioContext, "level-processor");

  streamSource.connect(node).connect(audioContext.destination);

  return node;
};

export const onAudioWorkletMessage = (
  el: Element | Window = window,
  username: string
) => {
  let flag: "VOICE" | "NONE" | undefined;
  return (event: MessageEvent<"VOICE" | "NONE">) => {
    if (flag === event.data) {
      return;
    }

    const customEvent = new CustomEvent("speaking", {
      detail: {
        remote: false,
        isSpeaking: event.data === "VOICE",
        username,
      },
    });

    document.dispatchEvent(customEvent);
    flag = event.data;
  };
};
