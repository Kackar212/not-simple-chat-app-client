/* eslint-disable @next/next/no-img-element */
"use client";

import { ErrorIcon } from "@components/icons";
import {
  KeyboardEventHandler,
  MutableRefObject,
  useCallback,
  useRef,
  useState,
} from "react";
import { Controller, get, useFormContext } from "react-hook-form";
import { Editable, RenderElementProps, Slate } from "slate-react";
import {
  Descendant,
  Editor,
  Element,
  Node,
  Text,
  Point,
  BaseRange,
  NodeEntry,
  BasePoint,
  RenderLeafProps,
} from "slate";
import { InputProps } from "./input-props.interface";
import { twMerge } from "tailwind-merge";
import { isBlock, SlateNode } from "@common/slate";
import hljs from "highlight.js";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import { parse } from "@common/marked";
import { SingleASTNode } from "@khanacademy/simple-markdown";

interface MessageInputProps extends InputProps {
  channelName?: string;
  editor: Editor;
  initialValue?: Descendant[];
  containerClassName?: string;
  formRef: MutableRefObject<HTMLFormElement | null>;
}

export const DEFAULT_MESSAGE_INPUT_NAME = "message";

const defaultInitialValue: Descendant[] = [
  {
    type: SlateNode.Paragraph,
    children: [{ text: "" }],
  },
];

const blocks = {
  blockquote: {
    trigger: "Space",

    regexp: /\>( )$/,
    block: {
      type: SlateNode.Blockquote as const,
      children: [{ type: "paragraph", children: [{ text: "" }] }],
    },
  } as const,
};

const iterator: Record<"currentTag" | "previousTag", Tag | null> = {
  currentTag: null,
  previousTag: null,
};

type Level = {
  required: number;
  trigger: (state: string, currentKey: string) => boolean;
  node: SlateNode;
};

type Tag = {
  current: number;
  inline: Level;
  block: Level;
};

const tags: Record<string, Tag> = {
  "`": {
    current: 0,
    inline: {
      required: 1,
      trigger: (state: string, currentKey: string) => {
        return currentKey === "`" && state.at(-1) !== "`";
      },
      node: SlateNode.Codespan,
    },
    block: {
      required: 3,
      trigger(state: string, currentKey: string) {
        return currentKey === "Enter";
      },
      node: SlateNode.Code,
    },
  },
  ">": {
    current: 0,
    inline: {
      required: -1,
      trigger() {
        return false;
      },
      node: SlateNode.Paragraph,
    },
    block: {
      required: 1,
      trigger(state: string, currentKey: string) {
        return currentKey === "Space";
      },
      node: SlateNode.Blockquote,
    },
  },
};

function hasCodeBlockStarted(node: Text) {
  return node.text === "```";
}

function hasLanguage(node: Text) {
  return node.text.replace("```", "") !== "";
}

function codeBlockLanguage(language: string) {
  const lang = hljs.getLanguage(language);

  if (lang) {
    return lang;
  }

  return language;
}

function codeBlockStart() {}
function codeBlockEnd() {}

let previousPath = [] as number[];

type CodeBlockToken = {
  isInCodeBlock: boolean;
  wasInCodeBlock: boolean;
  opensCodeBlock: boolean;
  isStyledCodeBlockLine: boolean;
  opensCodeBlockOnOwnLine: boolean;
  closesCodeBlock: false | BasePoint;
  lang: string | null;
  hljsTypes: Array<any> | null;
  blockEntry: [Element, [number]];
};

export function MessageInput({
  name = DEFAULT_MESSAGE_INPUT_NAME,
  channelName,
  editor,
  className,
  initialValue = defaultInitialValue,
  containerClassName,
  formRef,
}: MessageInputProps) {
  const {
    formState: { errors },
    control,
  } = useFormContext();

  const error = get(errors, name);

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      formRef.current?.requestSubmit();
    }
  };

  const renderElement = useCallback(
    ({ attributes, children, element }: RenderElementProps) => {
      switch (element.type) {
        case "blockquote":
          return <blockquote {...attributes}>{children}</blockquote>;
        case SlateNode.Emoji: {
          return (
            <div {...attributes}>
              <div contentEditable={false}>
                <img src="" alt="" width={22} height={22} />
              </div>
              {children}
            </div>
          );
        }
        default: {
          return (
            <p {...attributes} className="theme-dark">
              {children}
            </p>
          );
        }
      }
    },
    []
  );

  const renderLeaf = (props: RenderLeafProps) => {
    const emoji = EmojiMemoryStorage.getByName(props.leaf.emojiName);

    return (
      <span
        {...props.attributes}
        className={twMerge(
          props.leaf.strong && "font-bold",
          props.leaf.em && "italic",
          props.leaf.codespan &&
            "bg-[var(--primary-dark-630)] px-0.5 inline rounded-[4px] border-black-700 border font-code",
          props.leaf.hljs?.className && `${props.leaf.hljs?.className} text-sm`,
          props.leaf.del && "line-through",
          (props.leaf.spoiler || props.leaf.timestamp) && "bg-black-430",
          props.leaf.mark && "text-black-800 bg-yellow-300",
          (props.leaf.url || props.leaf.link) && "text-blue-300",
          props.leaf.subText && "text-sm text-gray-360"
        )}
      >
        {props.leaf.emoji && (
          <span contentEditable={false}>
            <img src={emoji?.url} alt="" width={22} height={22} />
          </span>
        )}
        {props.children}
      </span>
    );
  };

  function getLength(token: SingleASTNode, trim: boolean = false) {
    return trim ? token.content.trim().length : token.content.length;
  }
  const decorate = useCallback(([node, path]: NodeEntry) => {
    const ranges: {
      anchor: Point;
      focus: Point;
      [key: string]: any;
    }[] = [];

    if (!Text.isText(node)) {
      return ranges;
    }

    const tokens = parse(node.text);

    if (tokens.length === 0) {
      return ranges;
    }

    const token = tokens[0];

    if (!isBlock(token.type as SlateNode) || !token.tokens) {
      return ranges;
    }

    let start = 0;

    let hasOnlyText = true;
    let off = token.raw.replace(token.text, "").length;
    for (const child of tokens) {
      const length = getLength(child);

      const trimmedLength = getLength(child, true);
      const end = start + length;

      if (child.type !== "text") {
        const childOff = child.raw.replace(child.text, "").length / 2;

        const range: Record<string, any> = {
          emojiName: child.emoji,
          [child.type]: true,
        };

        ranges.push({
          codeBlockState,
          ...range,
          anchor: { path, offset: start + off + childOff },
          focus: { path, offset: start + trimmedLength + off - childOff },
        });
      }

      start = end;
    }

    return ranges;
  }, []);

  const codeBlockState = useRef<{
    language: string;
    hljsTypes: Array<BaseRange & { type: string }>;
    isInCodeBlock: boolean;
    wasInCodeBlock: boolean;
    isStyledCodeBlock: boolean;
  }>();

  return (
    <div
      className={twMerge(
        "relative bg-black-560 focus-within:focus-default pl-[44px] pr-[100px] py-3 w-full rounded-md",
        containerClassName
      )}
    >
      {/* <TipTapEditor /> */}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          return (
            <Slate
              editor={editor}
              initialValue={initialValue}
              onChange={(slateNodes) => {
                const newValue = slateNodes
                  .map((node) => Node.string(node))
                  .join("\n");

                if (field.value === newValue) {
                  return;
                }

                field.onChange(newValue);
              }}
            >
              <Editable
                aria-multiline="true"
                aria-label="New message"
                onKeyDown={onKeyDown}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                className={twMerge(
                  "text-white-500 focus:outline-none [word-break:break-word]",
                  className
                )}
                placeholder={`Send message in #${channelName}`}
              ></Editable>
            </Slate>
          );
        }}
      />
      <span
        className="text-red-500 text-sm absolute -top-2.5 -translate-y-full -left-12 sr-only"
        aria-live="polite"
      >
        {error && (
          <span className="flex items-center gap-1">
            <span aria-hidden>
              <ErrorIcon />
            </span>
            <span className="sr-only">Error: </span>
            {error.message}
          </span>
        )}
      </span>
    </div>
  );
}
