import {
  Decoration,
  DecorationSet,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { useCallback, useMemo } from "react";
import { UsePluginProps } from "./utils";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import { Emoji } from "@common/emojis/emoji.class";

class EmojiWidget extends WidgetType {
  constructor(private readonly emoji: Emoji) {
    super();
  }

  get estimatedHeight(): number {
    return 20;
  }

  eq(other: EmojiWidget) {
    return (
      other.emoji.id === this.emoji.id ||
      other.emoji.names.includes(this.emoji.uniqueName)
    );
  }

  toDOM() {
    const template = document.createElement("div");

    template.innerHTML = `
      <img src="${this.emoji.url}" width="20" height="20" alt="" aria-hidden="true" style="display:inline;"/>
    `;

    return template.firstElementChild as HTMLElement;
  }
}

export function useEmoji({ setAutocompleteState }: UsePluginProps) {
  // const autocomplete = useCallback(
  //   (update: ViewUpdate) => {
  //     setAutocompleteState((prevState) => ({
  //       ...prevState,
  //       ...getAutocompleteState(update, Tag.Emoji, RegEx.UnicodeEmoji),
  //       type: "emojis",
  //     }));
  //   },
  //   [setAutocompleteState]
  // );

  const createPlugin = useCallback(
    (matcher: MatchDecorator) =>
      ViewPlugin.fromClass(
        class {
          emojis: DecorationSet;
          constructor(view: EditorView) {
            this.emojis = matcher.createDeco(view);
          }
          update(update: ViewUpdate) {
            this.emojis = matcher.updateDeco(update, this.emojis);
          }
        },
        {
          decorations: (instance) => instance.emojis,
          provide: (plugin) =>
            EditorView.atomicRanges.of((view) => {
              return view.plugin(plugin)?.emojis || Decoration.none;
            }),
        }
      ),
    []
  );

  const unicodeEmojiMatcher = useMemo(
    () =>
      new MatchDecorator({
        regexp: /:(\w+):/g,
        decoration: (match) => {
          const emoji = EmojiMemoryStorage.getByName(match[1]);

          if (!emoji) {
            return null;
          }

          return Decoration.replace({
            widget: new EmojiWidget(emoji),
          });
        },
      }),
    []
  );

  const emojis = useMemo(
    () => createPlugin(unicodeEmojiMatcher),
    [unicodeEmojiMatcher, createPlugin]
  );

  const customEmojiMatcher = useMemo(
    () =>
      new MatchDecorator({
        regexp: /<:(\d+):>/g,
        decoration(match) {
          const emoji = EmojiMemoryStorage.getById(Number(match[1]));

          if (!emoji) {
            return null;
          }

          return Decoration.replace({
            widget: new EmojiWidget(emoji),
          });
        },
      }),
    []
  );

  const customEmojis = useMemo(
    () => createPlugin(customEmojiMatcher),
    [customEmojiMatcher, createPlugin]
  );

  return { emojis, customEmojis };
}
