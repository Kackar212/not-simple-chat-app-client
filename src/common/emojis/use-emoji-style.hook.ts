import { CSSProperties, useCallback, useMemo, useRef } from "react";
import { useEmojiProperties } from "./use-emoji-properties.hook";
import { MASK_COLUMNS, MASK_ROWS } from "./emojis.constants";

interface UseStyleProps {
  url?: {
    mask?: string;
    background?: string;
  };
  row?: number;
  column?: number;
  size?: number;
  columns?: number;
  rows?: number;
}

export function createStyle(
  type: "mask" | "background",
  columns: number = MASK_COLUMNS,
  rows: number = MASK_ROWS
) {
  return {
    [`${type}Image`]: `var(--${type}-url)`,
    [`${type}Size`]: `calc(${columns} * var(--size)) calc(${rows} * var(--size))`,
    [`${type}Position`]:
      "calc(-1 * var(--column) * var(--size)) calc(-1 * var(--row) * var(--size))",
  } as CSSProperties;
}

export function useEmojiStyle({
  row = 0,
  column = 0,
  size = 24,
  columns,
  rows,
  url,
}: UseStyleProps = {}) {
  const emojiStyle = useMemo(
    () => createStyle("background", columns, rows),
    [columns, rows]
  );
  const mask = useMemo(
    () => createStyle("mask", columns, rows),
    [columns, rows]
  );
  const { current: style } = useRef({ background: emojiStyle, mask });

  const properties = useEmojiProperties({ url, row, column, size });

  const result = useMemo(
    () => ({
      style,
      properties,
    }),
    [properties, style]
  );

  return result;
}
