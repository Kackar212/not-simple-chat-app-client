import SimpleMarkdown, {
  Capture,
  ParseFunction,
  Parser,
  ParserRule,
  SingleASTNode,
  State,
} from "@khanacademy/simple-markdown";

type Token = SingleASTNode & { content: string | SingleASTNode[] };

export interface CreateSimpleMarkdownExtensionProps<
  ExtensionToken extends Token
> {
  name: string;
  level: "inline" | "block";
  start: string | string[];
  tokenRegexp: RegExp;
  order?: number;
  match?: (source: string, state: State) => RegExpExecArray | null;
  parse?: (
    capture: Capture,
    nestedParse: Parser,
    state: State
  ) => Omit<ExtensionToken, "type"> | unknown[];
}

export const createSimpleMarkdownExtension = <ExtensionToken extends Token>({
  name,
  level,
  order = SimpleMarkdown.defaultRules.text.order,
  start,
  tokenRegexp,
  parse,
  match,
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
      const type = name;

      const previousInlineState = state.inline;

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
        ...result,
      };
    },
  } as const;
};
