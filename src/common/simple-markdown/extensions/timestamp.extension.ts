import { createSimpleMarkdownExtension } from "./create-extension";
import { format, formatRelative } from "date-fns";
import SimpleMarkdown from "@khanacademy/simple-markdown";

const tokenRegexp = /^<t:(-?\d{1,17})(?::(T|D|F|R|E))?>(\s+)?/;

export const NAME = "timestamp";

export interface Timestamp {
  type: typeof NAME;
  iso: string;
  content: string;
  formatted: string;
  fullDate: string;
  timestamp: number;
}

export const createTimestampExtension = () =>
  createSimpleMarkdownExtension({
    name: NAME,
    level: "inline",
    order: SimpleMarkdown.defaultRules.text.order - 0.75,
    tokenRegexp,
    parse(capture) {
      const [_raw, timestamp, dateFormat] = capture;
      const date = new Date(Number(timestamp));
      const fullDate = format(date, "PPPP 'at' p");

      let formatted;

      if (dateFormat === "R") {
        formatted = formatRelative(date, new Date());
      }

      if (dateFormat === "F") {
        formatted = fullDate;
      }

      if (dateFormat === "T") {
        formatted = format(date, "hh:mm:ss aa");
      }

      if (dateFormat === "D") {
        formatted = format(date, "MMMM d, y");
      }

      if (!formatted) {
        formatted = fullDate;
      }

      const token = {
        timestamp: Number(timestamp),
        formatted,
        iso: date.toISOString(),
        content: formatted,
        fullDate,
      } as const;

      return token;
    },
  });

export const timestamp = createTimestampExtension();
