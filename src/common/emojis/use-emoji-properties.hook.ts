import { CSSProperties, useMemo } from "react";

export interface UseEmojiPropertiesArgs {
  url?: {
    mask?: string;
    background?: string;
  };
  row?: number;
  column?: number;
  size?: number;
}

const getUrl = (file: string) =>
  new URL(
    `/assets/spritesheets/${file}`,
    process.env.NEXT_PUBLIC_APP_URL
  ).toString();

const mask = getUrl("masks.png");
const background = getUrl("mask-emojis.png");

export const createProperties = ({
  row = 0,
  column = 0,
  size = 40,
  url,
}: UseEmojiPropertiesArgs = {}) =>
  ({
    "--column": column,
    "--row": row,
    "--size": `${size}px`,
    "--mask-url": `url(${url?.mask || mask})`,
    "--background-url": `url(${url?.background || background})`,
  } as CSSProperties);

export function useEmojiProperties({
  url,
  row = 0,
  column = 0,
  size = 40,
}: UseEmojiPropertiesArgs = {}) {
  return useMemo(
    () =>
      ({
        "--column": column,
        "--row": row,
        "--size": `${size}px`,
        "--mask-url": `url(${url?.mask || mask})`,
        "--background-url": `url(${url?.background || background})`,
      } as CSSProperties),
    [row, column, size, url?.mask, url?.background]
  );
}
