import {
  insertNewlineContinueMarkup,
  markdown,
} from "@codemirror/lang-markdown";
import {
  defaultHighlightStyle,
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import {
  Decoration,
  DecorationSet,
  keymap,
  MatchDecorator,
  placeholder,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import {
  classHighlighter,
  styleTags,
  Tag,
  tagHighlighter,
  tags,
} from "@lezer/highlight";
import { Autolink, Emoji } from "@lezer/markdown";
import { EditorView, minimalSetup } from "codemirror";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Prec } from "@codemirror/state";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import { builder } from "@common/simple-markdown";
import { useMention } from "@common/editor/use-mention.hook";
import { useEmoji } from "@common/editor/use-emoji.hook";
import { getAutocompleteState, RegEx } from "@common/editor/utils";

interface CreateEditorProps {
  element: HTMLDivElement;
}

interface UseEditorProps {
  formRef: MutableRefObject<HTMLFormElement | null>;
  channelName: string;
  onChange: (value: string) => void;
}

// const emojiMatcher = new MatchDecorator({
//   regexp: /:(\d+):/g,
//   decoration: (match, _view, pos) => {
//     const emoji = EmojiMemoryStorage.getByName(match[1]);

//     if (!emoji) {
//       return null;
//     }

//     return Decoration.replace({
//       widget: new EmojiWidget(match[1]),
//     });
//   },
// });

// // const emojiNameMatcher = new MatchDecorator({})

// const emojiAutocompleteMatcher = new MatchDecorator({
//   regexp: /:(\w+)/g,
//   decoration: () => {
//     return null;
//   },
// });

const spoilerMatcher = new MatchDecorator({
  regexp: /\|\|([\s\S]+?)\|\|/g,
  decoration(match, view, pos) {
    return Decoration.mark({
      class: "cm-spoiler",
    });
  },
});

const spoilers = ViewPlugin.fromClass(
  class {
    spoilers: DecorationSet;
    constructor(view: EditorView) {
      this.spoilers = spoilerMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.spoilers = spoilerMatcher.updateDeco(update, this.spoilers);
    }
  },
  {
    decorations: (instance) => instance.spoilers,
  }
);

// const emojis = ViewPlugin.fromClass(
//   class {
//     emojis: DecorationSet;
//     constructor(view: EditorView) {
//       this.emojis = emojiMatcher.createDeco(view);
//     }
//     update(update: ViewUpdate) {
//       this.emojis = emojiMatcher.updateDeco(update, this.emojis);
//     }
//   },
//   {
//     decorations: (instance) => instance.emojis,
//     provide: (plugin) =>
//       EditorView.atomicRanges.of((view) => {
//         return view.plugin(plugin)?.emojis || Decoration.none;
//       }),
//   }
// );

const codeMarkTag = Tag.define();
const blockquoteMark = Tag.define();
const quoteMark = Tag.define();
const emoji = Tag.define();

const minHeightEditor = EditorView.theme(
  {
    ".cm-content, .cm-gutter": { paddingTop: "1.61px !important" },
  },
  { dark: true }
);

export type AutocompleteType = "Members" | "Emojis";

const result: {
  setEditor: (element: HTMLDivElement | null) => void;
  editor?: EditorView;
  searchTerm: string;
  cursorPosition: number;
  startIndex: number;
  type: AutocompleteType;
  clear: () => void;
} = {
  setEditor() {},
  searchTerm: "",
  cursorPosition: 0,
  startIndex: 0,
  type: "Members",
  clear: () => {},
};

export enum AutocompleteDataType {
  Members = "Members",
  Emojis = "Emojis",
}

export interface AutocompleteState {
  searchTerm: string;
  cursorPosition: number;
  startIndex: number;
  type: AutocompleteType;
}

const defaultState: AutocompleteState = {
  searchTerm: "",
  cursorPosition: 0,
  startIndex: 0,
  type: AutocompleteDataType.Emojis,
};

export function useEditor({ formRef, channelName, onChange }: UseEditorProps) {
  const [
    { searchTerm, cursorPosition, startIndex, type },
    setAutocompleteState,
  ] = useState(defaultState);

  const { mentions } = useMention({
    setAutocompleteState,
  });

  const { emojis, customEmojis } = useEmoji({
    setAutocompleteState,
  });

  result.clear = useCallback(() => {
    setAutocompleteState(defaultState);
  }, []);

  const onEnter = useCallback(() => {
    if (
      document.querySelector('ul[role="listbox"] > li[aria-selected="true"]')
    ) {
      return true;
    }

    formRef.current?.requestSubmit();

    return true;
  }, [formRef]);

  const keyBindings = useMemo(
    () =>
      Prec.highest(
        keymap.of([
          {
            key: "Enter",
            run: onEnter,
            preventDefault: true,
          },
          {
            key: "ArrowUp",
            run() {
              return true;
            },
            preventDefault: true,
          },
          {
            key: "ArrowDown",
            run() {
              return true;
            },
            preventDefault: true,
          },
        ])
      ),
    [onEnter]
  );

  const onUpdate = useCallback(
    (update: ViewUpdate) => {
      const {
        state: {
          selection: {
            main: { head: cursorPosition },
          },
        },
      } = update;

      const value = update.state.doc.toString();

      onChange(value);

      function getType(tag: string) {
        switch (tag) {
          case "@": {
            return AutocompleteDataType.Members;
          }

          case ":": {
            return AutocompleteDataType.Emojis;
          }

          default:
            throw new Error("type is not supported!");
        }
      }

      const tags = ["@", ":"];

      const autocomplete = tags
        .map(
          (tag) =>
            ({
              startIndex: value.slice(0, cursorPosition).lastIndexOf(tag),
              type: getType(tag),
            } as const)
        )
        .reduce(
          (result, autocompleteState) => {
            if (autocompleteState.startIndex > result.startIndex) {
              return autocompleteState;
            }

            return result;
          },
          { startIndex: -Infinity, type: AutocompleteDataType.Emojis }
        );

      const { type, startIndex } = autocomplete;

      // console.log({ type, startIndex });
      if (startIndex === -1) {
        setAutocompleteState(defaultState);

        return;
      }

      const rawSearchTerm = value.slice(startIndex, cursorPosition);

      if (tags.includes(rawSearchTerm)) {
        setAutocompleteState(defaultState);

        return;
      }

      let searchTerm = rawSearchTerm.substring(1);

      const typesMatchers = {
        [AutocompleteDataType.Members]: (rawSearchTerm: string) =>
          /^@((?!\s).)+$/.test(rawSearchTerm),
        [AutocompleteDataType.Emojis]: (rawSearchTerm: string) =>
          /^:((?!\s).)+$/.test(rawSearchTerm),
      } as const;

      const regEx = {
        [AutocompleteDataType.Members]: () =>
          new RegExp(`^<@\\d+>.*`).test(
            value.slice(startIndex - 1, cursorPosition)
          ),
        [AutocompleteDataType.Emojis]: () =>
          new RegExp(`^(<:|:)((\\d+)|(\\w+))(:|:>).*`).test(
            value.slice(startIndex - 1, cursorPosition)
          ),
      };

      const isFalsePositive = regEx[type]();

      if (!typesMatchers[type](rawSearchTerm) || isFalsePositive) {
        setAutocompleteState(defaultState);

        return;
      }

      setAutocompleteState({
        searchTerm,
        cursorPosition,
        startIndex,
        type,
      });
    },
    [onChange]
  );

  const editor = useRef<EditorView>();

  const createEditor = useCallback(
    ({ element }: CreateEditorProps) => {
      return new EditorView({
        extensions: [
          keyBindings,
          minimalSetup,
          EditorView.updateListener.of(onUpdate),
          EditorView.domEventHandlers({ focus() {} }),
          placeholder(`Send message in #${channelName}`),
          minHeightEditor,
          EditorView.lineWrapping,
          markdown({
            codeLanguages: languages,
            extensions: [
              Autolink,
              Emoji,
              {
                props: [
                  styleTags({
                    InlineCode: codeMarkTag,
                    Blockquote: blockquoteMark,
                    QuoteMark: quoteMark,
                    Emoji: emoji,
                  }),
                ],
              },
            ],
          }),
          syntaxHighlighting(
            HighlightStyle.define(
              [
                {
                  tag: codeMarkTag,
                  class: "editor-inline-code",
                },
                {
                  tag: tags.heading1,
                  textDecoration: "none !important",
                },
                { tag: tags.strikethrough, textDecoration: "line-through" },
                {
                  tag: tags.url,
                  textDecoration: "underline",
                  fontSize: "100%",
                },
                {
                  tag: emoji,
                  color: "red",
                },
              ],
              { themeType: "dark" }
            )
          ),
          syntaxHighlighting(
            tagHighlighter([
              { tag: tags.inserted, class: "hljs-addition" },
              { tag: tags.deleted, class: "hljs-deletion" },
            ])
          ),
          syntaxHighlighting(classHighlighter),
          syntaxHighlighting(defaultHighlightStyle),
          emojis,
          customEmojis,
          spoilers,
          mentions,
        ],
        parent: element,
      });
    },
    [channelName, customEmojis, emojis, keyBindings, mentions, onUpdate]
  );

  result.setEditor = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) {
        return;
      }

      if (editor.current) {
        editor.current.destroy();
      }

      editor.current = createEditor({ element });

      editor.current.contentDOM.role = "combobox";
      editor.current.contentDOM.ariaAutoComplete = "list";
      editor.current.contentDOM.ariaExpanded = "false";
    },
    [createEditor]
  );

  result.editor = editor.current;
  result.searchTerm = searchTerm;
  result.cursorPosition = cursorPosition;
  result.startIndex = startIndex;
  result.type = type;

  console.log(searchTerm);

  return result;
}
