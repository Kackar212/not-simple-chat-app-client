import { Emoji } from "./emoji.class";
import {
  DIVERSITY_SPRITE_SHEET_EMOJIS_PER_ROW,
  DIVERSITY_SPRITE_SHEET_ROWS,
  SPRITE_SHEET_EMOJIS_PER_ROW,
  SPRITE_SHEET_EMOJIS_ROWS,
} from "./emojis.constants";

const getColumns = (emoji: Emoji) => {
  return emoji.hasDiversity
    ? DIVERSITY_SPRITE_SHEET_EMOJIS_PER_ROW
    : SPRITE_SHEET_EMOJIS_PER_ROW;
};

const getRows = (emoji: Emoji) => {
  return emoji.hasDiversity
    ? DIVERSITY_SPRITE_SHEET_ROWS
    : SPRITE_SHEET_EMOJIS_ROWS;
};

const getColumn = (emoji: Emoji) => {
  return -emoji.spriteSheetIndex % getColumns(emoji);
};

const getRow = (emoji: Emoji) => {
  return -Math.floor(emoji.spriteSheetIndex / getColumns(emoji));
};

export const createEmojiStyleProperties = (emoji: Emoji) => {
  const file = emoji.hasDiversity
    ? "/emojis/emojis-10x30.png"
    : "/emojis/emojis.png";
  const url = new URL(file, process.env.NEXT_PUBLIC_API_URL).toString();
  const column = getColumn(emoji);
  const row = getRow(emoji);

  return {
    backgroundImage: `url(${url})`,
    backgroundSize: `calc(${getColumns(
      emoji
    )} * var(--size, 40px)) calc(${getRows(emoji)} * var(--size, 40px))`,
    backgroundPosition: `calc(${column} * var(--size, 40px)) calc(${row} * var(--size, 40px))`,
  };
};
