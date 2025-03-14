import { CSSProperties, FC, HTMLProps } from "react";
import twemoji from "@twemoji/api";
import { CustomEmoji } from "@common/api/schemas/emoji.schema";
import { Category } from "./emojis.types";
import { EmojiScope } from "@common/constants";

export enum EmojiType {
  Unicode,
  Custom,
}

export interface EmojiProps {
  names: string[];
  surrogates: string;
  hasDiversity?: boolean;
  hasMultiDiversity?: boolean;
  diversityChildren?: Tone[];
  serverId?: number;
  id?: number;
  uniqueName?: string;
}

interface Tone {
  names: string[];
  diversity: string[];
  surrogates: string;
  hasMultiDiversityParent?: boolean;
  hasDiversityParent?: boolean;
  id?: number;
  uniqueName?: string;
  serverId?: number;
}

export class Emoji {
  emojiObject: EmojiProps | Tone | CustomEmoji;
  children: Record<string, Emoji> = {};
  type: EmojiType;
  hasDiversity: boolean;
  surrogates: string;
  serverId?: number;
  id?: number;
  category?: Category;
  style: CSSProperties = {};
  spriteSheet = {
    url: "",
    column: 0,
    row: 0,
  };
  #spriteSheetIndex: number = -1;
  #isFirstInCategory: boolean = false;
  #categoryIndex: number = -1;
  #Icon: FC<HTMLProps<SVGElement>> = () => null;

  constructor(
    emojiObject: EmojiProps | Tone | CustomEmoji,
    type: EmojiType = EmojiType.Unicode,
    category?: Category
  ) {
    this.emojiObject = emojiObject;
    this.type = type;
    this.hasDiversity = false;
    this.surrogates = "";
    this.serverId = emojiObject.serverId;
    this.id = emojiObject.id;
    this.category = category;

    if ("surrogates" in emojiObject) {
      this.surrogates = emojiObject.surrogates;
    }

    if ("diversityChildren" in emojiObject) {
      this.hasDiversity = !!emojiObject.hasDiversity;

      emojiObject.diversityChildren?.forEach((tone) => {
        const key = tone.diversity.join("-");

        this.children[key] = new Emoji(tone, EmojiType.Unicode, category);
      });
    }
  }

  isLocked(serverId?: number) {
    if (this.isPrivate && !serverId) {
      return true;
    }

    return this.isPrivate && this.serverId !== serverId;
  }

  get placeholder() {
    if ("placeholder" in this.emojiObject) {
      return this.emojiObject.placeholder;
    }
  }

  get isPrivate() {
    if ("scope" in this.emojiObject) {
      return this.emojiObject.scope === EmojiScope.Private;
    }

    return false;
  }

  get codePoint() {
    return twemoji.convert.toCodePoint(this.surrogates);
  }

  get url() {
    if ("url" in this.emojiObject) {
      const url = new URL(this.emojiObject.url);

      if (url.protocol === "blob:") {
        return url.toString();
      }

      url.searchParams.append("width", "48");
      url.searchParams.append("height", "48");
      url.searchParams.append("format", "webp");

      url.search = url.searchParams.toString();

      return url.toString();
    }

    const codePoints = twemoji.convert.toCodePoint(this.surrogates).split("-");

    if (codePoints.at(-1) === "fe0f" && codePoints.length === 2) {
      codePoints.pop();
    }

    return new URL(
      `${codePoints.join("-")}.svg`,
      "https://raw.githubusercontent.com/jdecked/twemoji/refs/heads/main/assets/svg/"
    ).toString();
  }

  get uniqueName() {
    if ("name" in this.emojiObject) {
      return this.emojiObject.name;
    }

    return this.emojiObject.uniqueName || this.emojiObject.names[0];
  }

  set spriteSheetIndex(spriteSheetIndex: number) {
    this.#spriteSheetIndex = spriteSheetIndex;
  }

  set isFirstInCategory(isFirstInCategory: boolean) {
    this.#isFirstInCategory = isFirstInCategory;
  }

  set categoryIndex(categoryIndex: number) {
    this.#categoryIndex = categoryIndex;
  }

  set Icon(Icon: FC<HTMLProps<SVGElement>>) {
    this.#Icon = Icon;
  }

  get Icon() {
    return this.#Icon;
  }

  get isFirstInCategory() {
    return this.#isFirstInCategory;
  }

  get categoryIndex() {
    return this.#categoryIndex;
  }

  get spriteSheetIndex() {
    return this.#spriteSheetIndex;
  }

  get serializedNames() {
    return this.names.map((name) => `:${name}:`).join(" ");
  }

  get names() {
    if ("names" in this.emojiObject) {
      return this.emojiObject.names;
    }

    return [this.uniqueName];
  }

  get isUnicode() {
    return this.type === EmojiType.Unicode;
  }

  get diversity() {
    return "diversity" in this.emojiObject ? this.emojiObject.diversity : [];
  }
}
