import SimpleMarkdown, {
  Capture,
  ParseFunction,
  Parser,
  ParserRule,
  SingleASTNode,
  State,
} from "@khanacademy/simple-markdown";
import { ReactNode } from "react";

type Token = SingleASTNode & { content: string | SingleASTNode[] };

export interface CreateSimpleMarkdownExtensionProps<
  ExtensionToken extends Token
> {
  name: string;
  level: "inline" | "block";
  tokenRegexp: RegExp;
  order?: number;
  match?: (source: string, state: State) => RegExpExecArray | null;
  parse?: (
    capture: Capture,
    nestedParse: Parser,
    state: State
  ) => Omit<ExtensionToken, "type"> | unknown[];
  html?: (node: SingleASTNode) => string;
  react?: () => ReactNode;
}

export const createSimpleMarkdownExtension = <ExtensionToken extends Token>({
  name,
  level,
  order = SimpleMarkdown.defaultRules.text.order,
  tokenRegexp,
  parse,
  match,
  react = () => "",
  html = () => "",
}: CreateSimpleMarkdownExtensionProps<ExtensionToken>) => {
  return {
    tokenRegexp,
    order,
    match(source: string, state: State) {
      return match
        ? match.call(this, source, state)
        : tokenRegexp?.exec(source);
    },
    parse(capture: Capture, nestedParse: Parser, state: State) {
      const markdownParse =
        level === "inline"
          ? SimpleMarkdown.parseInline
          : SimpleMarkdown.parseBlock;

      if (!parse) {
        return {
          content: markdownParse(nestedParse, capture[1], state),
        };
      }

      const result = parse(capture, nestedParse, state);

      if (Array.isArray(result)) {
        return result;
      }

      return {
        type: name,
        ...result,
      };
    },
    react,
    html,
  } as const;
};
