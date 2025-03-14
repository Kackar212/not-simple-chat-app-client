import { rtcContext } from "@common/rtc";
import { useSafeContext } from "./use-safe-context.hook";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const RecordingState = {
  Inactive: "inactive",
  Paused: "paused",
  Recording: "recording",
} as const;

export function useRecorder(onBlob: (blob: Blob) => void = () => {}) {
  const { microphone, toggleMicrophone } = useSafeContext(rtcContext);

  const [{ recorder, recordingState, recordedAudio }, setRecorderState] =
    useState<{
      recorder?: MediaRecorder;
      recordedAudio?: Blob;
      recordingState: RecordingState;
    }>({ recordingState: "inactive" });

  const blobs = useRef<Blob[]>([]);
  const ref = useRef<HTMLAudioElement | null>(null);

  const setRef = useCallback((audio: HTMLAudioElement | null) => {
    ref.current = audio;
  }, []);

  let timeout = useRef(-1);

  const clearRecorder = useCallback(async () => {
    setRecorderState({
      recorder: undefined,
      recordedAudio: undefined,
      recordingState: RecordingState.Inactive,
    });

    blobs.current = [];

    await toggleMicrophone(true);
    await microphone.stop();
  }, [microphone, toggleMicrophone]);

  useEffect(() => {
    if (!recorder) {
      return;
    }

    const onDataAvailable = ({
      data,
      currentTarget,
      eventPhase,
    }: BlobEvent) => {
      if (recorder.state === RecordingState.Inactive) {
        blobs.current.push(data);

        return;
      }

      if (!data.type.startsWith("audio/") || data.size === 0) {
        return;
      }

      blobs.current.push(data);
    };

    const onStop = async () => {
      if (!recorder) {
        return;
      }

      const blob = new Blob([...blobs.current], { type: recorder.mimeType });
      document.dispatchEvent(
        new CustomEvent("recorderdata", { detail: { blob } })
      );
      onBlob(blob);

      blobs.current = [];

      setRecorderState((prevState) => ({
        ...prevState,
        recordingState: RecordingState.Inactive,
        recordedAudio: blob,
      }));

      await toggleMicrophone(true);
      await microphone.stop();
    };

    const onPause = () => {
      setRecorderState((prevState) => ({
        ...prevState,
        recordingState: RecordingState.Paused,
      }));
    };

    const onResume = () => {
      setRecorderState((prevState) => ({
        ...prevState,
        recordingState: RecordingState.Recording,
      }));
    };

    recorder.addEventListener("resume", onResume);
    recorder.addEventListener("pause", onPause);
    recorder.addEventListener("stop", onStop);
    recorder.addEventListener("dataavailable", onDataAvailable);

    return () => {
      recorder.removeEventListener("stop", onStop);
      recorder.removeEventListener("dataavailable", onDataAvailable);
    };
  }, [microphone, onBlob, recorder, toggleMicrophone]);

  let ignorePause = useRef(false);

  useEffect(() => {
    const onVoiceActivation = ({
      detail: { isSpeaking },
    }: CustomEvent<{ isSpeaking: boolean }>) => {
      console.log(isSpeaking);
      if (!recorder) {
        return;
      }

      recorder.stream.getTracks().forEach((track) => {
        track.enabled = isSpeaking;
      });
    };

    document.addEventListener("voiceactivation", onVoiceActivation);

    return () => {
      document.removeEventListener("voiceactivation", onVoiceActivation);
    };
  }, [recorder]);

  const startRecording = useCallback(async () => {
    const recorderStream = await microphone.get();
    recorderStream.getTracks().forEach((track) => {
      track.enabled = false;
    });

    await toggleMicrophone(false);

    const recorder = new MediaRecorder(recorderStream);

    recorder.start();

    setTimeout(() => {
      setRecorderState((prevState) => ({
        ...prevState,
        recordingState: RecordingState.Recording,
        recorder,
      }));
    });
  }, [microphone, toggleMicrophone]);

  return {
    recorder,
    startRecording,
    recordingState,
    isRecording:
      recordingState === RecordingState.Recording ||
      recordingState === RecordingState.Paused,
    ref,
    setRef,
    recordedAudio,
    dataUrl: recordedAudio && URL.createObjectURL(recordedAudio),
    clearRecorder,
  };
}
