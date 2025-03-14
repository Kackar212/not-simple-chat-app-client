import { Spoiler } from "@components/spoiler/spoiler.component";
import { createElement, CSSProperties, Fragment, ReactNode } from "react";
import { Emoji } from "@components/markdown/emoji.component";
import {
  code,
  CustomTokenType,
  directMessageRequest,
  emoji,
  emoticon,
  mark,
  MarkedExtensionToken,
  spoiler,
  subText,
  timestamp,
  url,
} from "@common/marked/extensions";
import { twMerge } from "tailwind-merge";
import hljs from "highlight.js";
import CheckmarkIcon from "/public/assets/icons/checkmark.svg";
import SimpleMarkdown, {
  ParserRules,
  SingleASTNode,
  Capture,
  State,
  Parser,
} from "@khanacademy/simple-markdown";
import { DirectMessageRequest } from "@components/markdown/direct-message-request.component";

interface CreateReactElementProps {
  key: string | number;
  depth?: number;
  isOnlyOneElement?: boolean;
}

export type TokenWithText = SingleASTNode & { content: string };
export type TokenWithChildren = SingleASTNode & {
  content: Array<TokenWithText | TokenWithChildren>;
};

export type Token = TokenWithChildren | TokenWithText;

interface Builder {
  key: string | number;
  isOnlyOneElement: boolean;
  depth: number;
  createReactElement: (
    token: Token,
    props: { key: string | number; depth?: number; isOnlyOneElement?: boolean }
  ) => ReactNode;
  createChildren: (token: Token) => ReactNode[];
  fromSource: <State extends Record<string, unknown>>(
    source: string,
    state?: State
  ) => ReactNode[];
  linkify: (source: string) => ReactNode[];
}

function createChildren(this: Builder, token: Token) {
  if (token.type === "list") {
    token.content = token.items.map((tokens: SingleASTNode[]) => ({
      type: "list_item",
      content: tokens,
    }));
  }

  if (Array.isArray(token.content)) {
    return token.content.map((token, index) =>
      this.createReactElement(token, {
        key: `${this.key}_${index}`,
        depth: ++this.depth,
      })
    );
  }

  return [token.content];
}

export function createReactElementFromMarkedToken(
  this: Builder,
  token: Token,
  props: CreateReactElementProps
): ReactNode {
  let { key, depth = 0, isOnlyOneElement = false } = props;

  this.depth = depth;
  this.key = key;
  this.isOnlyOneElement = isOnlyOneElement;

  const children = this.createChildren(token);

  if (token.type === "text" || token.type === "escape") {
    return (
      <span className="whitespace-break-spaces" key={key}>
        {children}
      </span>
    );
  }

  if (token.type === "spoiler") {
    return <Spoiler key={key}>{children}</Spoiler>;
  }

  if (token.type === "inlineCode") {
    return <code key={key}>{children}</code>;
  }

  if (token.type === "timestamp") {
    const timestampToken = token as unknown as MarkedExtensionToken.Timestamp;

    return (
      <time
        className="timestamp"
        dateTime={timestampToken.iso}
        aria-label={timestampToken.fullDate}
        data-tooltip-id="tooltip"
        data-tooltip-content={timestampToken.fullDate}
        key={key}
      >
        {timestampToken.formatted}
      </time>
    );
  }

  if (token.type === "codeBlock") {
    const language = hljs.getLanguage(token.lang);

    return (
      <pre className="theme-dark" key={key}>
        {language && language.name && (
          <code
            className={`hljs language-${token.lang}`}
            dangerouslySetInnerHTML={{
              __html: hljs.highlight(token.content as string, {
                language: language.name,
              }).value,
            }}
          ></code>
        )}

        {!language && <code className="hljs">{children}</code>}
      </pre>
    );
  }

  if (token.type === "hr") {
    return <hr key={key} className="my-4" />;
  }

  if (token.type === "blockQuote") {
    if (depth === 5) {
      return children;
    }

    return (
      <div className="md-quote" key={key}>
        <blockquote>{children}</blockquote>
      </div>
    );
  }

  if (token.type === "emoji" || token.type === "emoticon") {
    return (
      <Emoji
        key={key}
        token={token as MarkedExtensionToken.Emoji}
        isOnlyElement={isOnlyOneElement}
      />
    );
  }

  if (token.type === CustomTokenType.DirectMessageChannel) {
    return (
      <DirectMessageRequest
        key={token.channelId}
        channelId={token.channelId}
        messageId={token.messageId}
      />
    );
  }

  if (token.type === "paragraph") {
    return children;
  }

  if (token.type === "newline") {
    return (
      <span key={key} className="whitespace-break-spaces">
        {children}
      </span>
    );
  }

  if (token.type === "heading") {
    let depth = Math.abs(token.level - 6);

    if (token.level > 1 && token.level < 6) {
      depth += 1;
    }

    return (
      <span
        style={{
          fontSize: `calc(0.35em * ${depth}`,
        }}
        className="my-2 font-bold leading-none"
        key={key}
      >
        {children}
      </span>
    );
  }

  if (token.type === "link" || token.type === CustomTokenType.Url) {
    const hasHref = "target" in token && typeof token.target === "string";

    if (!hasHref) {
      return token.target;
    }

    if (
      !token.target.startsWith("http://") &&
      !token.target.startsWith("https://") &&
      !token.target.startsWith("steam://") &&
      !token.target.startsWith("www.")
    ) {
      return token.target;
    }

    return createElement(
      Fragment,
      { key },
      createElement(
        "a",
        {
          href: token.target,
          title: token.title,
          target: "_blank",
          rel: "noreferrer noopener",
        },
        ...children
      ),
      //@ts-ignore
      token.space && <span>{token.space}</span>
    );
  }

  if (token.type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={token.href}
        alt={token.title}
        width={168}
        height={0}
        className="aspect-[1/2]"
        key={key}
      />
    );
  }

  if (token.type === "list") {
    return createElement(
      token.ordered ? "ol" : "ul",
      { key, style: { padding: 0 } },
      ...children
    );
  }

  if (token.type === "list_item") {
    if (token.task) {
      return (
        <li
          key={key}
          style={{ marginLeft: "27px" }}
          className="flex relative items-center marker:content-none"
        >
          <span
            className={twMerge("fake-checkbox", token.checked && "checked")}
          >
            <span>
              {token.checked && (
                <CheckmarkIcon
                  className="absolute"
                  style={{ left: "-1px", top: "-1px" }}
                />
              )}
            </span>
          </span>
          {children}
        </li>
      );
    }

    return createElement(
      "li",
      { key, style: { marginLeft: "27px" } },
      ...children
    );
  }

  if (token.type === CustomTokenType.SubText) {
    return (
      <span
        className="text-xs text-gray-360"
        style={{ color: "#949ba4" } as CSSProperties}
        key={key}
      >
        {children}
      </span>
    );
  }

  return createElement(token.type, { key }, ...children);
}

export const parse = SimpleMarkdown.parserFor({
  ...SimpleMarkdown.defaultRules,
  spoiler,
  mark,
  emoji,
  emoticon,
  codeBlock: code,
  subText,
  timestamp,
  url,
  directMessageRequest,
  blockQuote: {
    ...SimpleMarkdown.defaultRules.blockQuote,
    match(source: string, state: State) {
      const required = "> ";
      if (
        !source.trim().startsWith(required) &&
        !source.trim().startsWith(">>> ")
      ) {
        return null;
      }

      const result =
        /^( *>>> +([\s\S]*))|^( *>(?!>>) +[^\n]*(\n *>(?!>>) +[^\n]*)*\n?)/.exec(
          source
        );

      return result;
    },
    parse(capture: Capture, parse: Parser, state: State) {
      state.inline = true;
      const content = parse(
        capture[0].replace(/^ *>* ?/, "").replace(/^ *>>> ?/, ""),
        state
      );

      if (content.at(-1)?.content === "\n\n") {
        content.pop();
      }

      const token = {
        content,
      };

      state.inline = false;

      return token;
    },
  },
} as unknown as ParserRules);

export const builder: Builder = {
  createReactElement: createReactElementFromMarkedToken,
  createChildren,
  key: "",
  isOnlyOneElement: false,
  depth: 0,
  fromSource(source: string, state) {
    const tokens = parse(source, state || { inline: false }) as Token[];

    if (tokens.at(-1)?.content === "\n\n") {
      tokens.pop();
    }

    return tokens.map((token, index) =>
      this.createReactElement(token, { key: index })
    );
  },
  linkify(source: string) {
    const parse = SimpleMarkdown.parserFor({
      link: SimpleMarkdown.defaultRules.link,
      text: SimpleMarkdown.defaultRules.text,
      paragraph: SimpleMarkdown.defaultRules.paragraph,
    });

    const tokens = parse(source) as Token[];

    if (Array.isArray(tokens[0].content)) {
      return tokens[0].content.map((token, index) => {
        if (token.type === "link") {
          return (
            <a href={token.target} key={index}>
              {token.target}
            </a>
          );
        }

        return token.content as string;
      });
    }

    return [];
  },
};
