import { PauseIcon } from "@components/icons/pause.icon";
import { PlayIcon } from "@components/icons/play.icon";
import {
  Dispatch,
  HTMLProps,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import GifIcon from "/public/assets/icons/gif.svg";

interface VideoAttachmentProps extends HTMLProps<HTMLVideoElement> {
  url: string;
  isGif: boolean;
  isVideo: boolean;
  width: number;
  height: string | number;
  poster?: string;
  tabIndex?: number;
  isLoading?: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export function VideoAttachment({
  url,
  isGif,
  isVideo,
  width,
  height,
  poster,
  tabIndex,
  isLoading,
  setIsLoading,
  ...attributes
}: VideoAttachmentProps) {
  const [isPaused, setIsPaused] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleVideo = useCallback(() => {
    setIsPaused((isPaused) => !isPaused);

    if (isLoading) {
      return;
    }

    const isLoaded = videoRef.current?.readyState === 4;
    if (!isLoaded) {
      videoRef.current?.load();

      setIsLoading(true);

      return;
    }

    if (!videoRef.current?.paused) {
      videoRef.current?.pause();

      return;
    }

    videoRef.current?.play();
  }, [setIsLoading, isLoading]);

  return (
    <div className="relative size-full">
      {isGif && (
        <>
          <button
            onClick={toggleVideo}
            className="absolute items-center bottom-2 right-2 justify-center z-10 flex box-content stroke-2 stroke-black-630"
            tabIndex={tabIndex}
          >
            <span className="sr-only">{isPaused ? "Play" : "Pause"}</span>
            {isPaused && <PlayIcon className="size-7" />}
            {!isPaused && <PauseIcon className="size-7" />}
          </button>
          <div className="absolute top-2 left-2 z-[1] size-[25px] flex justify-center items-center bg-black-630 rounded-md">
            <GifIcon className="size-[15px] scale-200" />
          </div>
          <div className="sr-only" aria-live="polite">
            {isPaused ? "Video is paused" : "Video is playing"}
          </div>
        </>
      )}
      <video
        src={url}
        controls={isVideo}
        className={twMerge(
          "object-cover rounded-lg relative block min-w-full min-h-full max-w-[calc(100%+1px)]",
          isVideo && "z-[6]"
        )}
        loop={isGif}
        preload="none"
        poster={poster}
        playsInline={isGif}
        muted={isGif}
        ref={videoRef}
        tabIndex={tabIndex}
        {...attributes}
        onLoadedData={(e) => {
          if (!isPaused) {
            videoRef.current?.play();
          }

          attributes.onLoadedData?.(e);
        }}
      ></video>
    </div>
  );
}
