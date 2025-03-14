import { AttachmentType } from "@common/enums/attachment-type.enum";

export interface HistoryFile<CustomData extends Record<string, unknown>> {
  remove: () => void;
  update: (obj: CustomData) => void;
  type: AttachmentType;
  file: File;
  url: string;
  size: `${number} ${"B" | "KB" | "MB"}`;
  name: string;
  width: number;
  height: number;
  isGif: boolean;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  isText: boolean;
  isOther: boolean;
  customData: CustomData;
}
