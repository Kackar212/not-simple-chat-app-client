import { AttachmentType } from "@common/enums/attachment-type.enum";
import { EyeIcon, EyeSlashIcon } from "@components/icons";
import { DocumentIcon } from "@components/icons/document.icon";
import { Link } from "@components/link/link.component";
import { MouseEventHandler, useCallback, useRef } from "react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import TrashIcon from "/public/assets/icons/trash-bin.svg";
import { HistoryFile } from "@components/upload/history-file.interface";
import { VoiceClipPlayer } from "@components/voice-clip-player/voice-clip-player.component";

export function PreviewAttachment({
  file,
  name,
  url,
  isGif,
  isImage,
  isAudio,
  isOther,
  isVideo,
  isText,
  size,
  width,
  height,
  update,
  remove,
  open,
  customData: { isSpoiler },
  type,
}: HistoryFile<{ isSpoiler: boolean }> & {
  open: (file: HistoryFile<{ isSpoiler: boolean }>) => void;
}) {
  const fileRef = useRef(file);

  const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault();

      update({ isSpoiler: !isSpoiler });
    },
    [update, isSpoiler]
  );

  return (
    <li
      key={name}
      className="flex flex-col relative min-w-64 min-h-64 max-w-64 max-h-64 rounded-[4px] bg-black-630 text-white-500 opacity-85 hover:opacity-100 has-[a:focus]:opacity-100 has-[a:focus]:focus-default overflow-hidden"
    >
      <span className="h-8 shadow-md top-0 right-20 absolute text-sm px-3 py-2 leading-none z-20 bg-black-630 rounded-ss-[4px] border-r border-white-500 border-opacity-10">
        {size}
      </span>
      <div className="flex w-fit self-end shadow-md bg-black-630 z-50 absolute">
        <button
          type="button"
          className="px-2 py-1 hover:bg-gray-500"
          onClick={onClick}
        >
          <span className="sr-only">
            {isSpoiler ? "Unmark" : "Mark as a spoiler"}
          </span>
          {isSpoiler ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
        <div className="sr-only" aria-live="polite">
          {isSpoiler
            ? "attachment is marked as a spoiler"
            : "attachment is not marked as a spoiler"}
        </div>
        <button
          type="button"
          onClick={remove}
          className="px-2 py-1 text-red-500 hover:bg-gray-500"
        >
          <span className="sr-only">Remove attachment</span>
          <TrashIcon className="size-6" />
        </button>
      </div>
      <div
        className={twMerge(
          "flex p-1.5 relative mt-auto overflow-hidden",
          isSpoiler && "h-full"
        )}
      >
        <div className="overflow-hidden w-full rounded-[4px] bg-black-500 h-full m-auto">
          <div
            className={twMerge(
              "hidden uppercase font-bold text-sm rounded-full bg-black-700 px-6 py-2 z-10 pointer-events-none",
              isSpoiler &&
                "flex absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]"
            )}
            aria-hidden
          >
            Spoiler
          </div>
          {/* <div className="bg-black-1000 bg-opacity-60 absolute top-0 left-0 size-full"></div> */}
          <div
            className={twMerge(
              "flex flex-col w-full justify-center items-center h-full",
              isSpoiler && "blur-2xl"
            )}
          >
            {(isImage || isGif) && (
              <Image
                src={url}
                alt=""
                width={200}
                height={200}
                className="object-contain rounded-[3px] max-h-full w-auto"
              />
            )}
            {isAudio && (
              <audio src={url} controls className="w-full z-10"></audio>
            )}
            {/* {isAudio && isVoiceClip && (
              <VoiceClipPlayer isRecording={false} blob={fileRef.current} />
            )} */}
            {isVideo && (
              <video src={url} controls className="z-10 rounded-[3px]"></video>
            )}
            {(isOther || isText) && (
              <div className="flex justify-center w-full bg-black-600">
                <span className="sr-only">Open pdf preview</span>
                <DocumentIcon />
              </div>
            )}
          </div>
        </div>
      </div>
      <Link
        href={url}
        className="flex items-center justify-center mt-auto focus:outline-none before:size-full before:absolute before:top-0 px-3 py-1 border-t border-solid border-black-500 bg-black-630 text-sm"
        onClick={(e) => {
          e.preventDefault();

          if (isSpoiler) {
            update({ isSpoiler: false });

            return;
          }

          open({
            file,
            name,
            url,
            size,
            isImage,
            isAudio,
            isOther,
            isVideo,
            isText,
            isGif,
            width,
            height,
            update,
            remove,
            customData: { isSpoiler },
            type,
          });
        }}
      >
        <span className="text-ellipsis overflow-hidden whitespace-nowrap mt-auto">
          {name}
        </span>
      </Link>
      {/* </div> */}
    </li>
  );
}
