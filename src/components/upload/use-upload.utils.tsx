import { AttachmentType } from "@common/enums/attachment-type.enum";
import { getFileSizeWithUnit } from "@common/utils";

export function getVideoDimensions(
  url: string,
  resolve: (result: { width: number; height: number }) => void
) {
  const video = document.createElement("video");
  video.src = url;
  video.className = "sr-only";

  document.body.appendChild(video);

  video.addEventListener("loadeddata", ({ currentTarget }) => {
    const isTargetVideo = currentTarget instanceof HTMLVideoElement;
    if (!isTargetVideo) {
      return;
    }

    video.remove();

    resolve({
      width: currentTarget.videoWidth,
      height: currentTarget.videoHeight,
    });
  });
}

export function getImageDimensions(
  url: string,
  resolve: (result: { width: number; height: number }) => void
) {
  const img = document.createElement("img");
  img.src = url;

  img.addEventListener("load", ({ currentTarget }) => {
    const isTargetVideo = currentTarget instanceof HTMLImageElement;
    if (!isTargetVideo) {
      return;
    }

    resolve({
      width: currentTarget.naturalWidth,
      height: currentTarget.naturalHeight,
    });
  });
}

export async function mapFileToHistoryFile(file: File) {
  const [type] = file.type.split(";");
  const url = URL.createObjectURL(file);

  const fileType =
    Object.values(AttachmentType).find((fileType: AttachmentType) => {
      if (fileType === AttachmentType.Gif && type.startsWith("image/gif")) {
        return true;
      }

      return type.startsWith(fileType.toLowerCase());
    }) || AttachmentType.Other;

  const isGif = fileType === AttachmentType.Gif;
  const isImage = fileType === AttachmentType.Image;
  const isVideo = fileType === AttachmentType.Video;
  const isAudio = fileType === AttachmentType.Audio;
  const isText = fileType === AttachmentType.Text;
  const isOther = fileType === AttachmentType.Other;

  const { width, height } = await new Promise<{
    width: number;
    height: number;
  }>((resolve) => {
    if (isText || isOther) {
      return resolve({ width: -1, height: -1 });
    }

    if (isVideo || isAudio) {
      return getVideoDimensions(url, resolve);
    }

    getImageDimensions(url, resolve);
  });

  return {
    url,
    file,
    name: file.name,
    size: getFileSizeWithUnit(file.size),
    isImage,
    isVideo,
    isAudio,
    isText,
    isOther,
    isGif,
    width,
    height,
    type: fileType,
  };
}
