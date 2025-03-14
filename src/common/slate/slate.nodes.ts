export enum SlateNode {
  Blockquote = "blockquote",
  Code = "code",
  Codespan = "codespan",
  Paragraph = "paragraph",
  Image = "image",
  Emoji = "emoji",
  SubText = "subText",
}

export const slateNodes: {
  [key in SlateNode]: {
    isInline?: boolean;
    isVoid?: boolean;
    isBlock?: boolean;
  };
} = {
  blockquote: {
    isInline: true,
  },
  code: {
    isBlock: true,
  },
  codespan: {
    isInline: true,
  },
  paragraph: {
    isBlock: true,
  },
  image: {
    isVoid: true,
  },
  emoji: {
    isVoid: true,
    isInline: true,
  },
  subText: {
    isBlock: true,
  },
};
