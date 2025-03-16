/* eslint-disable @next/next/no-img-element */
import React, { MouseEventHandler, useState } from "react";
import { deleteAttachment } from "@common/api";
import { Attachment } from "@common/api/schemas/attachment.schema";
import { AttachmentType } from "@common/enums/attachment-type.enum";
import { DownloadIcon } from "@components/icons/download.icon";
import { Link } from "@components/link/link.component";
import { twMerge } from "tailwind-merge";
import { DocumentAttachment } from "./document-attachment.component";
import { VideoAttachment } from "./video-attachment.component";
import { Loader } from "@components/loader/loader.component";
import { download } from "@common/utils";
import { DocumentIcon } from "@components/icons/document.icon";
import { SpeakerIcon } from "@components/icons/speaker.icon";
import { Button } from "@components/button/button.component";
import { useMutation } from "@common/api/hooks/use-mutation.hook";
import { EyeSlashIcon } from "@components/icons";
import { toast } from "react-toastify";
import { VoiceClipPlayer } from "@components/voice-clip-player/voice-clip-player.component";
import Image from "next/image";
import TrashIcon from "/public/assets/icons/trash-bin.svg";
import { useSafeContext } from "@common/hooks";
import { chatContext } from "@components/chat/chat.context";

const MAX_WIDTH = 640;

interface MessageAttachmentProps
  extends Omit<
    Attachment,
    "contentType" | "extension" | "messageId" | "poster"
  > {
  isCurrentUserAuthor: boolean;
  isMessageOptimistic: boolean;
  isSubMessage: boolean;
  originalUrl?: string;
  isEmbed?: boolean;
  poster?: string | null;
}

export function MessageAttachment({
  type,
  originalName,
  name,
  url,
  id,
  size,
  isSpoiler,
  isCurrentUserAuthor,
  width,
  height,
  poster,
  isMessageOptimistic,
  isSubMessage,
  placeholder,
  isVoiceClip,
  originalUrl = url,
  isEmbed = false,
}: MessageAttachmentProps) {
  const [isHidden, setIsHidden] = useState(isSpoiler);
  const deleteAttachmentMutation = useMutation({
    mutationFn: deleteAttachment,
  });
  const [canShowActions, setCanShowActions] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isOtherOrText =
    type === AttachmentType.Other || type === AttachmentType.Text;
  const isImage = type === AttachmentType.Image;
  const isVideo = type === AttachmentType.Video;
  const isAudio = type === AttachmentType.Audio;
  const isGif = type === AttachmentType.Gif;
  const { data } = deleteAttachmentMutation;
  const isSuccessOrPending =
    data?.status.isSuccess || deleteAttachmentMutation.isPending;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(isOtherOrText);
  const { channelId } = useSafeContext(chatContext);

  if (width === 0 && height === 0) {
    return null;
  }

  const ratio = width / height;
  const cappedWidth = Math.round(width > MAX_WIDTH ? MAX_WIDTH : width);
  const cappedHeight = Math.round(
    cappedWidth === MAX_WIDTH ? cappedWidth / ratio : height
  );

  if (isDeleted || hasError) {
    return null;
  }

  if (size === 0) {
    return null;
  }

  const newUrl = new URL(url);

  if (isImage) {
  }

  if (isGif && !isMessageOptimistic) {
    newUrl.searchParams.set("format", "mp4");
  }

  if (!isMessageOptimistic && !isOtherOrText) {
    newUrl.searchParams.set("width", cappedWidth.toString());
  }

  newUrl.search = newUrl.searchParams.toString();

  const showAttachment: MouseEventHandler = (e) => {
    if (!isHidden) {
      return;
    }

    e.preventDefault();

    setIsHidden(false);
  };

  const downloadFile: MouseEventHandler<HTMLAnchorElement> = async (e) => {
    e.preventDefault();

    const target = e.currentTarget;
    const { originalName, name } = target.dataset;

    download(target.href, originalName || name);
  };

  const onMouseEnter = () => {
    setCanShowActions(true);
  };

  const onMouseLeave = () => {
    setCanShowActions(false);
  };

  const tabIndex = isHidden ? -1 : undefined;
  const imagePlaceholder = placeholder;

  return (
    <div
      className={twMerge(
        "w-full grid max-w-[var(--attachment-width,640px)] mt-2",
        isVoiceClip && "mt-0",
        isSubMessage &&
          "h-fit grid-flow-row grid-cols-[repeat(auto-fill,minmax(100%,1fr))] indent-0 min-h-0 min-w-0 py-0.5 relative box-content"
      )}
      style={
        {
          "--attachment-width":
            cappedWidth === -1 ? `${MAX_WIDTH}px` : `${cappedWidth}px`,
        } as React.CSSProperties
      }
    >
      <div
        className={twMerge(
          "grid h-fit grid-flow-row grid-cols-[repeat(auto-fill, minmax(100%,1fr))] w-full relative rounded-lg has-[.spoiler:focus-visible]:focus-default "
        )}
        onClick={showAttachment}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {deleteAttachmentMutation.isPending && (
          <div className="z-20 bg-black-1000/80 absolute flex top-0 left-0 size-full items-center justify-center">
            <Loader />
          </div>
        )}
        {deleteAttachmentMutation.isSuccess && (
          <div
            aria-hidden
            className="z-20 bg-red-500/75 absolute flex top-0 left-0 size-full items-center justify-center text-white-500"
          >
            <span className="bg-red-500 px-4 py-2 rounded-full flex">
              Removed <TrashIcon className="size-6" />
            </span>
          </div>
        )}
        {isSpoiler && isHidden && (
          <button
            type="button"
            className="z-50 absolute top-0 left-0 size-full flex justify-center items-center focus:*:outline-default"
            aria-label="Remove spoiler"
            onClick={showAttachment}
          >
            <span className="spoiler uppercase font-bold text-sm rounded-full bg-black-700 px-6 py-2 pointer-events-none flex">
              Spoiler
            </span>
          </button>
        )}
        {!isOtherOrText && !isAudio && (
          <Link
            href={originalUrl}
            aria-label={`Go see ${originalName} file`}
            className="absolute top-0 left-0 size-full z-[5] rounded-lg -outline-offset-4 focus-visible:outline-4 outline-blue-500"
            onClick={showAttachment}
            target={isHidden ? undefined : "_blank"}
            tabIndex={tabIndex}
          ></Link>
        )}
        <div
          className="w-full overflow-hidden rounded-lg"
          aria-hidden={isHidden}
        >
          <div
            className={twMerge(
              "flex flex-nowrap h-full w-full",
              isHidden && "blur-[48px] cursor-pointer"
            )}
          >
            <div
              className={twMerge(
                "w-fit flex justify-start items-center relative has-[a:focus-visible]:focus-default rounded-lg",
                !isLoaded &&
                  !isImage &&
                  !isAudio &&
                  "bg-gradient-to-r from-black-560 from-25% via-black-500 via-50% to-black-560 to-100% animate-skeleton bg-[size:200%]",
                !isLoaded && "overflow-hidden"
              )}
              style={{
                width: cappedWidth === -1 ? "100%" : `${cappedWidth}px`,
                height: "100%",
                minHeight: "100%",
                maxHeight: "calc(100% + 1px)",
                aspectRatio:
                  cappedWidth === -1 ? undefined : cappedWidth / cappedHeight,
              }}
            >
              {(isVideo || isGif) && isLoading && (
                <Loader className="absolute right-3 top-3 mix-blend-exclusion z-50" />
              )}
              {isOtherOrText && (
                <DocumentAttachment
                  url={url}
                  size={size}
                  isHidden={isHidden}
                  originalName={originalName}
                  Icon={<DocumentIcon className="size-10" />}
                  showAttachment={showAttachment}
                  tabIndex={tabIndex}
                />
              )}
              {isImage && (
                <Image
                  src={newUrl.toString()}
                  width={cappedWidth}
                  height={cappedHeight}
                  className={twMerge(
                    "rounded-lg object-cover block min-w-full min-h-full max-w-[calc(100%+1px)]"
                  )}
                  alt=""
                  loading="lazy"
                  placeholder={placeholder ? "blur" : undefined}
                  blurDataURL={placeholder || undefined}
                  onLoadStart={() => setIsLoading(true)}
                  onLoad={() => setIsLoaded(true)}
                  onError={() => {
                    setHasError(true);
                  }}
                />
              )}
              {(isVideo || isGif) && (
                <VideoAttachment
                  url={newUrl.toString()}
                  isGif={isGif}
                  isVideo={isVideo}
                  width={cappedWidth}
                  height={cappedHeight}
                  poster={poster || undefined}
                  isLoading={isLoading}
                  tabIndex={tabIndex}
                  setIsLoading={setIsLoading}
                  onError={() => setHasError(true)}
                  onLoadedData={() => {
                    setIsLoaded(true);
                    setIsLoading(false);
                  }}
                />
              )}
              {isAudio && !isVoiceClip && (
                <div className="flex flex-col w-fit relative focus-within:focus-default">
                  <DocumentAttachment
                    url={url}
                    size={size}
                    isHidden={isHidden}
                    originalName={originalName}
                    Icon={<SpeakerIcon className="size-10" />}
                    showAttachment={showAttachment}
                    className="rounded-b-none static bg-black-560 focus-within:outline-0"
                  />
                  <audio
                    src={url}
                    controls
                    className="bg-black-560 object-cover rounded-lg rounded-t-none p-4 -mt-4 relative block min-w-full min-h-full max-w-[calc(100%+1px)] z-10"
                  ></audio>
                </div>
              )}
              {isAudio && isVoiceClip && (
                <VoiceClipPlayer isRecording={false} src={url} />
              )}
            </div>
          </div>
        </div>
        {!isHidden && canShowActions && !isSuccessOrPending && !isEmbed && (
          <div className="absolute flex items-center -top-4 -right-2 z-50 bg-black-560/100 border border-black-630 shadow-lg rounded-[4px]">
            <Link
              href={url}
              download={originalName}
              className="z-10 p-1.5 bg-transparent rounded-md"
              data-tooltip-content="Download"
              data-tooltip-id="tooltip"
              data-original-name={originalName}
              data-name={name}
              onClick={downloadFile}
            >
              <span className="sr-only">Go to file</span>
              <DownloadIcon className="size-6" />
            </Link>
            {isCurrentUserAuthor && !isMessageOptimistic && (
              <>
                <Button
                  onClick={async () => {
                    if (deleteAttachmentMutation.isPending) {
                      return;
                    }

                    await deleteAttachmentMutation.mutateAsync({
                      attachmentId: id,
                      channelId,
                    });

                    setTimeout(() => {
                      setIsDeleted(true);
                    }, 2500);

                    setCanShowActions(false);

                    toast.success("Attachment removed!");
                  }}
                  className={twMerge(
                    "z-10 bg-transparent text-red-500 hover:bg-red-500 hover:text-white-500 p-1.5 rounded-none"
                  )}
                  data-tooltip-content="Delete"
                  data-tooltip-id="tooltip"
                  mutationResult={deleteAttachmentMutation.data.status}
                >
                  <span className="sr-only">Remove {originalName}</span>
                  <TrashIcon className="size-6" />
                </Button>
              </>
            )}
            {isSpoiler && (
              <Button
                aria-label="Hide attachment"
                data-tooltip-content="Hide"
                data-tooltip-id="tooltip"
                className="text-white-500 z-10 p-1.5 bg-transparent rounded-md hover:bg-transparent rounded-e-[4px]"
                onClick={() => setIsHidden(true)}
              >
                <EyeSlashIcon />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
