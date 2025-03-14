import emojis from "./emojis.json";
import { EmojiMemoryStorage } from "./emojis.storage";

export const asciiRegexp =
  /^(>:\(|>:\-\(|>=\(|>=\-\(|:"\)|:\-"\)|="\)|=\-"\)|<\/3|<\\3|:\-\\|:\-\/|=\-\\|=\-\/|:'\(|:'\-\(|:,\(|:,\-\(|='\(|='\-\(|=,\(|=,\-\(|:\(|:\-\(|=\(|=\-\(|<3|♡|\]:\(|\]:\-\(|\]=\(|\]=\-\(|o:\)|O:\)|o:\-\)|O:\-\)|0:\)|0:\-\)|o=\)|O=\)|o=\-\)|O=\-\)|0=\)|0=\-\)|:'D|:'\-D|:,D|:,\-D|='D|='\-D|=,D|=,\-D|:\*|:\-\*|=\*|=\-\*|x\-\)|X\-\)|:\||:\-\||=\||=\-\||:o|:\-o|:O|:\-O|=o|=\-o|=O|=\-O|:@|:\-@|=@|=\-@|:D|:\-D|=D|=\-D|:'\)|:'\-\)|:,\)|:,\-\)|='\)|='\-\)|=,\)|=,\-\)|:\)|:\-\)|=\)|=\-\)|\]:\)|\]:\-\)|\]=\)|\]=\-\)|:,'\(|:,'\-\(|;\(|;\-\(|=,'\(|=,'\-\(|:P|:\-P|=P|=\-P|8\-\)|B\-\)|,:\(|,:\-\(|,=\(|,=\-\(|,:\)|,:\-\)|,=\)|,=\-\)|:s|:\-S|:z|:\-Z|:\$|:\-\$|=s|=\-S|=z|=\-Z|=\$|=\-\$|;\)|;\-\))/;

const surrogatesRegexp =
  /\ud83c[\udffb-\udfff](?=\ud83c[\udffb-\udfff])|(?:[^\ud800-\udfff][\u0300-\u036f\ufe20-\ufe2f\u20d0-\u20ff]?|[\u0300-\u036f\ufe20-\ufe2f\u20d0-\u20ff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe2f\u20d0-\u20ff]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe2f\u20d0-\u20ff]|\ud83c[\udffb-\udfff])?)*/g;

export const categorySizes = Object.values(emojis).map(
  (emojis) => emojis.length
);

const SpriteSheet = {
  Default: {
    columns: 42,
    rows: 39,
    url: "",
  },
  Diversity: {
    columns: 10,
    rows: 31,
    url: "",
  },
  Mask: {
    columns: 19,
    rows: 3,
    url: "",
  },
  MaskEmoji: {
    columns: 19,
    rows: 3,
    url: "",
  },
} as const;

function getToken(surrogates: string) {
  const name = EmojiMemoryStorage.getBySurrogates(surrogates);

  if (name) {
    return { type: "emojiName", text: `:${name.uniqueName}:` } as const;
  }

  return { type: "text", text: surrogates } as const;
}

const flagEmoji = "🏴";

const re =
  /[\u200d\ud800-\udfff\u0300-\u036f\ufe20-\ufe2f\u20d0-\u20ff\ufe0e\ufe0f\u270b\u2b50\u2728\u26a1\u26c5\u26c4\u2614\u2615\u26bd\u26be\u26f3\u26f5\u2693\u26fd\u26f2\u26fa\u26ea\u231a\u23f0\u231b\u23f3\u26ce\u2648\u2649\u264a\u264b\u264c\u264d\u264e\u264f\u2650\u2651\u2652\u2653\u270a\u274c\u2b55\u26d4\u2757\u2755\u2753\u2754\u2705\u274e\u267f\u23e9\u23ea\u23eb\u23ec\u2795\u2796\u2797\u27b0\u27bf\u26aa\u26ab\u25fe\u25fd\u2b1b\u2b1c\u26a7]/;

export function translateEmojis(str: string, isOnlyEmoji: boolean = true) {
  if (isOnlyEmoji && re.test(str)) {
    return [getToken(str)];
  }

  const result: Array<{ type: "emojiName" | "text"; text: string }> = [];

  let matchResult = str.match(surrogatesRegexp);
  const emojis = matchResult ? [...matchResult] : [];

  let lastEmoji = "";
  emojis.forEach((emoji) => {
    if (lastEmoji && emoji === "") {
      emoji = emoji + lastEmoji;

      lastEmoji = "";
    }

    if (lastEmoji && /^[\u{E0061}-\u{E007A}]$/u.test(emoji)) {
      lastEmoji += emoji;

      return;
    }

    if (lastEmoji) {
      result.push(getToken(lastEmoji));

      lastEmoji = "";
    }

    if (!lastEmoji && emoji === flagEmoji) {
      lastEmoji = emoji;

      return;
    }

    let token = getToken(emoji);

    if (result.length > 0) {
      let lastToken = result[result.length - 1];

      if ("text" === lastToken.type && "text" === token.type) {
        lastToken.text += token.text;

        return;
      }
    }

    result.push(token);
  });

  if (lastEmoji) {
    result.push(getToken(lastEmoji));
  }

  return result;
}

export const categories = EmojiMemoryStorage.getAll().filter(
  (emoji) => emoji.isFirstInCategory
);
