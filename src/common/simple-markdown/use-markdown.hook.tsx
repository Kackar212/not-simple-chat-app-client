import { builder } from "@common/simple-markdown";
import { useMemo, useRef } from "react";
import { translateEmojis } from "@common/emojis";
import { MessageType } from "@common/enums/message-type.enum";

export function useMarkdown<State extends Record<string, unknown> = {}>(
  source: string,
  state: State
) {
  const stateRef = useRef(state);

  const children = useMemo(() => {
    const { current: state } = stateRef;

    const translatedSource = translateEmojis(source, false)
      .map(({ text }) => text)
      .join("");

    const requestId = btoa(crypto.randomUUID());
    const directMessageRequestMessage =
      state.type === MessageType.Request && `[${state.type}:${requestId}]`;

    return builder.fromSource(
      directMessageRequestMessage
        ? directMessageRequestMessage
        : translatedSource,
      { ...state, requestId }
    );
  }, [source]);

  return children;
}
