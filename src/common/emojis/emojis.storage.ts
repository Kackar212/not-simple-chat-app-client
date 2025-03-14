import { CustomEmoji } from "@common/api/schemas/emoji.schema";
import { Emoji, EmojiType } from "./emoji.class";
import { Category } from "./emojis.types";
import { createEmojiStyleProperties } from "./emojis.helpers";
import emojis from "./emojis.json";
import asciiEmojis from "./ascii-emojis.json";
import EmojiIcon from "/public/assets/icons/emoji.svg";
import NatureIcon from "/public/assets/icons/nature.svg";
import FoodIcon from "/public/assets/icons/food.svg";
import ActivityIcon from "/public/assets/icons/activity.svg";
import TravelIcon from "/public/assets/icons/travel.svg";
import ObjectsIcon from "/public/assets/icons/objects.svg";
import SymbolsIcon from "/public/assets/icons/symbols.svg";
import FlagsIcon from "/public/assets/icons/flags.svg";

const emojiIcons = [
  EmojiIcon,
  NatureIcon,
  FoodIcon,
  ActivityIcon,
  TravelIcon,
  ObjectsIcon,
  SymbolsIcon,
  FlagsIcon,
];

const skinToneToIndexMap: Record<string, number> = {
  "1f3fb": 0,
  "1f3fc": 1,
  "1f3fd": 2,
  "1f3fe": 3,
  "1f3ff": 4,
};

export class EmojiMemoryStorage {
  static #initialized = false;
  static #storage: Array<Emoji> = [];
  static #storageMap: Map<string, Emoji> = new Map();
  static #surrogatesMap: Map<string, string> = new Map();

  static getByName(name: string) {
    return this.#storageMap.get(name);
  }

  static getAll() {
    return [...this.#storage];
  }

  static getByAscii(ascii: string) {
    const emojiName = asciiEmojis[ascii as keyof typeof asciiEmojis];

    if (!emojiName) {
      return;
    }

    return this.getByName(emojiName);
  }

  static delete(key: string) {
    this.#storageMap.delete(key);
    this.#surrogatesMap.delete(key);
  }

  static getBySurrogates(surrogates: string) {
    const name = this.#surrogatesMap.get(surrogates);

    if (!name) {
      return;
    }

    return this.getByName(name);
  }

  static set(emoji: Emoji) {
    if (this.#storageMap.has(emoji.uniqueName)) {
      return;
    }

    this.#storage.unshift(emoji);
    this.#storageMap.set(emoji.uniqueName, emoji);
  }

  static setCustomEmojis(emojis: CustomEmoji[]) {
    emojis.forEach((customEmoji) => {
      this.set(new Emoji(customEmoji, EmojiType.Custom));
    });
  }

  static initialize() {
    if (this.#initialized) {
      return;
    }

    const currentIndex = {
      withDiversity: 0,
      withoutDiversity: 0,
    };

    this.#storage = Object.entries(emojis).flatMap(
      ([category, emojis], categoryIndex) => {
        return emojis.map((emojiObject, index) => {
          const emoji = new Emoji(
            emojiObject,
            EmojiType.Unicode,
            category as Category
          );

          emoji.isFirstInCategory = index === 0;

          if (emoji.isFirstInCategory) {
            emoji.Icon = emojiIcons[categoryIndex];
          }

          emoji.categoryIndex = categoryIndex;

          emoji.spriteSheetIndex = emoji.hasDiversity
            ? currentIndex.withDiversity++
            : currentIndex.withoutDiversity++;

          emoji.style = createEmojiStyleProperties(emoji);

          emoji.names.forEach((name) => {
            this.#storageMap.set(name, emoji);
            this.#surrogatesMap.set(emoji.surrogates, name);
          });

          Object.entries(emoji.children).forEach(([_codePoints, child]) => {
            const { diversity } = child;
            const index = skinToneToIndexMap[diversity[0]] + 1;

            child.names.forEach((name) => {
              this.#storageMap.set(name, child);
              this.#surrogatesMap.set(child.surrogates, name);
            });

            emoji.names.forEach((name) => {
              this.#storageMap.set(`${name}::skin-tone-${index}`, child);
              this.#surrogatesMap.set(
                child.surrogates,
                `${name}::skin-tone-${index}`
              );
            });
          });

          return emoji;
        });
      }
    );

    this.#initialized = true;
  }
}

EmojiMemoryStorage.initialize();
