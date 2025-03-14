import PlayIcon from "/public/assets/icons/play.svg";
import PauseIcon from "/public/assets/icons/pause.svg";
import {
  CSSProperties,
  MutableRefObject,
  PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import WaveSurfer from "wavesurfer.js";
import CloseIcon from "/public/assets/icons/close.svg";
import { useFormContext } from "react-hook-form";

const MAX_CLIP_DURATION = 60;

interface VoiceClipProps {
  isRecording: boolean;
  recorder?: MediaRecorder;
  src?: string;
  blob?: Blob;
  clearRecorder?: () => void;
  destroy?: boolean;
}

function trimSilence(pcmData: number[] | Float32Array, threshold = 0.001) {
  const length = pcmData.length;
  let start = 0;
  let end = length - 1;

  while (start < length && Math.abs(pcmData[start]) < threshold) {
    start++;
  }

  while (end > start && Math.abs(pcmData[end]) < threshold) {
    end--;
  }

  return pcmData.slice(start, end + 1);
}

export function VoiceClipPlayer({
  isRecording,
  recorder,
  src,
  blob,
  children,
  clearRecorder = () => {},
}: PropsWithChildren<VoiceClipProps>) {
  const [
    { progressValue, isPaused, waveSurfer, currentTime, url, duration, width },
    setPlayerState,
  ] = useState<{
    duration: number;
    currentTime: number;
    progressValue: number;
    isPaused: boolean;
    width: number;
    url?: string;
    waveSurfer: WaveSurfer | null;
  }>({
    duration: 0,
    currentTime: 0,
    progressValue: 0,
    isPaused: true,
    width: 20,
    waveSurfer: null,
    url: src,
  });
  const interval = useRef<number>(-1);
  const value = useRef(0);
  const waveContainerRef = useRef<HTMLDivElement | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const { current: audio } = useRef(new Audio());
  const id = useRef(crypto.randomUUID());
  const { setError, clearErrors } = useFormContext();

  let ignore = useRef<boolean>(false);

  const closeVoiceClip = useCallback(async () => {
    setPlayerState({
      currentTime: 0,
      duration: 0,
      isPaused: true,
      progressValue: 0,
      url: undefined,
      waveSurfer: null,
      width: 0,
    });
    clearRecorder();
    if (waveContainerRef.current) {
      waveContainerRef.current.innerHTML = "";
    }
  }, [clearRecorder]);

  const createWave = useCallback(
    (srcOrBlob: Blob | string) => {
      const waveContainer = waveContainerRef.current;
      const waveSurfer = WaveSurfer.create({
        container: waveContainer!,
        height: 12,
        waveColor: "rgb(255, 255, 255)",
        progressColor: "hsl(234.935 85.556% 64.706%)",
        barWidth: 3,
        barGap: 1,
        barRadius: 999,
        normalize: true,
        cursorWidth: 0,
        renderFunction(peaks, ctx) {
          let vScale = this.barHeight || 1;
          if (this.normalize) {
            const max = Array.from(peaks[0]).reduce(
              (max, value) => Math.max(max, Math.abs(value)),
              0
            );
            vScale = max ? 1 / max : 1;
          }

          peaks[0] = trimSilence(peaks[0]);
          peaks[1] = trimSilence(peaks[1] || peaks[0]);

          if (peaks[0].length === 0 && peaks[1].length === 0) {
            setError("message", { message: "Nothing was recorded!" });

            setTimeout(() => {
              clearErrors("message");
            }, 5000);

            closeVoiceClip();

            return;
          }

          const topChannel = peaks[0];
          const bottomChannel = peaks[1] || peaks[0];
          const length = topChannel.length;

          const { width, height } = ctx.canvas;
          const halfHeight = height / 2;
          const pixelRatio = Math.max(1, window.devicePixelRatio || 1);

          const barWidth = this.barWidth ? this.barWidth * pixelRatio : 1;
          const barGap = this.barGap
            ? this.barGap * pixelRatio
            : this.barWidth
            ? barWidth / 2
            : 0;
          const barRadius = this.barRadius || 0;
          const barIndexScale = width / (barWidth + barGap) / length;

          const rectFn = barRadius && "roundRect" in ctx ? "roundRect" : "rect";

          ctx.beginPath();

          let prevX = 0;
          let maxTop = 0;
          let maxBottom = 0;
          for (let i = 0; i <= length; i++) {
            const x = Math.round(i * barIndexScale);

            if (x > prevX) {
              const topBarHeight = Math.round(maxTop * halfHeight * vScale);
              const bottomBarHeight = Math.round(
                maxBottom * halfHeight * vScale
              );
              const barHeight = topBarHeight + bottomBarHeight || 1;

              let y = halfHeight - topBarHeight;
              if (this.barAlign === "top") {
                y = 0;
              } else if (this.barAlign === "bottom") {
                y = height - barHeight;
              }

              ctx[rectFn](
                prevX * (barWidth + barGap),
                y,
                barWidth,
                barHeight,
                barRadius
              );

              prevX = x;
              maxTop = 0;
              maxBottom = 0;
            }

            const magnitudeTop = Math.abs(topChannel[i] || 0);
            const magnitudeBottom = Math.abs(bottomChannel[i] || 0);
            if (magnitudeTop > maxTop) maxTop = magnitudeTop;
            if (magnitudeBottom > maxBottom) maxBottom = magnitudeBottom;
          }

          ctx.fill();
          ctx.closePath();
        },
      });

      const audio = waveSurfer.getMediaElement();
      audio.src =
        typeof srcOrBlob === "string"
          ? srcOrBlob
          : URL.createObjectURL(srcOrBlob);
      audio.load();

      //I needed to use this hack to get correct audio duration because of this https://issues.chromium.org/issues/40482588
      const onLoadedMetadata = () => {
        if (audio.duration === Infinity || isNaN(Number(audio.duration))) {
          audio.currentTime = 1e101;

          audio.addEventListener("timeupdate", getDuration);
        }

        audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      };

      audio.addEventListener("loadedmetadata", onLoadedMetadata);

      waveSurfer.getMediaElement();

      async function getDuration(event: Event) {
        const isAudioElement = event.target instanceof HTMLAudioElement;

        if (!isAudioElement) {
          return;
        }

        event.target.currentTime = 0;
        event.target.removeEventListener("timeupdate", getDuration);

        const duration = Math.round(event.target.duration);
        const width = Math.max(20, duration * 4 + 2);

        waveSurfer.once("loading", () => {
          setIsAudioLoading(true);
        });

        waveSurfer.once("load", () => {
          setIsAudioLoading(false);
        });

        setPlayerState({
          duration,
          currentTime: Math.round(event.target.duration),
          progressValue: 0,
          isPaused: true,
          waveSurfer: waveSurfer,
          width,
        });

        await waveSurfer.load(event.target.src);
      }
    },
    [clearErrors, closeVoiceClip, setError]
  );

  useEffect(() => {
    if (!url || ignore.current) {
      return;
    }

    createWave(url);

    ignore.current = true;
  }, [createWave, url]);

  const onBlob = useCallback(
    async ({ detail: { blob } }: CustomEvent<{ blob: Blob }>) => {
      createWave(blob);

      value.current = 0;
    },
    [createWave]
  );

  useLayoutEffect(() => {
    if (!recorder) {
      return;
    }

    document.addEventListener("recorderdata", onBlob);

    return () => {
      document.removeEventListener("recorderdata", onBlob);
    };
  }, [onBlob, recorder]);

  useEffect(() => {
    window.clearInterval(interval.current);

    if (!isRecording || !recorder) {
      return;
    }

    interval.current = window.setInterval(() => {
      const isMaxDurationReached = value.current >= MAX_CLIP_DURATION - 1;

      if (isMaxDurationReached) {
        clearInterval(interval.current);

        recorder.stop();

        setPlayerState((prevState) => ({ ...prevState, progressValue: 0 }));

        return;
      }

      value.current += 1;

      setPlayerState((prevState) => ({
        ...prevState,
        progressValue: prevState.progressValue + 1,
      }));
    }, 1000);

    return () => {
      window.clearInterval(interval.current);
    };
  }, [isRecording, recorder]);

  const currentTimeInterval = useRef<number>(-1);

  const toggleState = useCallback(() => {
    if (isRecording) {
      window.clearInterval(interval.current);

      recorder?.stop();

      setPlayerState((prevState) => ({ ...prevState, progressValue: 0 }));

      return;
    }

    window.clearInterval(currentTimeInterval.current);

    if (!waveSurfer) {
      return;
    }

    waveSurfer.unAll();

    const onAudioEnd = () => {
      window.clearInterval(currentTimeInterval.current);

      setPlayerState((prevState) => ({
        ...prevState,
        currentTime: prevState.duration,
        isPaused: true,
      }));

      waveSurfer.seekTo(0);
    };

    waveSurfer.on("finish", onAudioEnd);

    if (isPaused) {
      waveSurfer.play();

      currentTimeInterval.current = window.setInterval(() => {
        setPlayerState((prevState) => {
          return {
            ...prevState,
            currentTime: prevState.currentTime - 1,
          };
        });
      }, 1000);
    }

    if (!isPaused) {
      waveSurfer.pause();

      window.clearInterval(currentTimeInterval.current);
    }

    setPlayerState((prevState) => ({
      ...prevState,
      isPaused: !prevState.isPaused,
    }));
  }, [isRecording, recorder, isPaused, waveSurfer]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    let time = `${String(minutes - hours * 60).padStart(2, "0")}:${String(
      seconds - minutes * 60
    ).padStart(2, "0")}`;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${time}`;
    }

    return time;
  };

  const setWaveContainer = useCallback((element: HTMLDivElement | null) => {
    waveContainerRef.current = element;
  }, []);

  return (
    <>
      <section
        aria-label="Voice clip"
        className={twMerge(
          "p-1 pr-2 bg-black-630 rounded-4xl w-fit relative overflow-hidden hidden",
          (isRecording || src || blob) && "flex"
        )}
      >
        <div className="flex items-center relative z-10">
          {children}
          {recorder && blob && (
            <button
              type="button"
              onClick={closeVoiceClip}
              className="bg-black-700 text-white-500 p-1.5 rounded-[50%] flex items-center mr-1"
            >
              <CloseIcon className="size-4" />
              <span className="sr-only">Delete voice clip</span>
            </button>
          )}
          <button
            type="button"
            className={twMerge(
              "bg-black-700 text-white-500 p-1.5 rounded-[50%] flex items-center",
              isRecording && "p-2"
            )}
            aria-label={isRecording ? "Stop recording" : "Play"}
            aria-pressed={isRecording ? undefined : !isPaused}
            onClick={toggleState}
            aria-disabled={isPaused && isAudioLoading}
          >
            {isRecording && (
              <span className="inline-block size-3 rounded-xs bg-white-500"></span>
            )}
            {isPaused && !isRecording && <PlayIcon className="size-4" />}
            {!isPaused && !isRecording && <PauseIcon className="size-4" />}
          </button>
          {isRecording && (
            <span className="text-white-500 text-xs ml-1.5 [letter-spacing:0.1rem]">
              {formatDuration(progressValue)} /{" "}
              {formatDuration(MAX_CLIP_DURATION)}
            </span>
          )}
          {/* {!isRecording && ( */}
          <div className="flex items-center ml-2 gap-2 text-gray-150 text-sm">
            <div
              className={twMerge(
                "text-white-500 text-sm",
                isRecording && "hidden"
              )}
              aria-hidden
              style={{
                width,
              }}
              ref={setWaveContainer}
            ></div>
            {!isRecording && <span>{formatDuration(currentTime)}</span>}
          </div>
          {/* )} */}
          {!isRecording && (
            <>
              <label className="sr-only" htmlFor={`duration_${id.current}`}>
                Duration
              </label>
              <span id={`total_time_${id.current}`} className="sr-only">
                total time: {formatDuration(duration)}
              </span>
              <input
                type="range"
                aria-valuemin={0}
                aria-valuemax={duration}
                id={`duration_${id.current}`}
                aria-valuenow={duration - currentTime}
                min={0}
                max={100}
                step={0.01}
                aria-valuetext={`current time: ${formatDuration(
                  duration - currentTime
                )}`}
                aria-describedby={`total_time_${id.current}`}
                className="sr-only"
              />
            </>
          )}
        </div>
        <span
          className={twMerge(
            "absolute left-0 -translate-x-full top-0 w-full h-full bg-black-700/30 z-0 hover:translate-x-0",
            progressValue > 0 &&
              "transition-[translate] ease-linear duration-[59000ms] voice-clip-progress"
          )}
        ></span>
      </section>
      <span className="sr-only" aria-live="polite">
        You are being recorded, after a minute or when you stop recording you
        can choose to send or delete the recording.
      </span>
    </>
  );
}
