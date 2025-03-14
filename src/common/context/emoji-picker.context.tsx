import { createContext, PropsWithChildren, useCallback, useState } from "react";

interface Position {
  left?: number;
  top?: number;
}

interface EmojiPickerContext {
  left: number;
  bottom: number;
  isOpen: boolean;
  setPosition: (stickToElement: HTMLElement) => void;
  openPicker: (stickToElement: HTMLElement) => void;
}

const defaultContext = {
  left: -1,
  bottom: -1,
  isOpen: false,
  setPosition() {},
  openPicker() {},
};

export const emojiPickerContext =
  createContext<EmojiPickerContext>(defaultContext);

export function EmojiPickerProvider({ children }: PropsWithChildren) {
  const [emojiPicker, setEmojiPicker] = useState(defaultContext);

  const openPicker = useCallback((stickToElement: HTMLElement) => {
    setEmojiPicker((emojiPicker) => ({
      ...emojiPicker,
      isOpen: !emojiPicker.isOpen,
    }));
  }, []);

  const setPosition = useCallback((stickToElement: HTMLElement) => {
    const top = 0;
    const left = 0;

    setEmojiPicker((emojiPicker) => ({
      ...emojiPicker,
      top: top || 0,
      left: left || 0,
    }));
  }, []);

  return (
    <emojiPickerContext.Provider
      value={{ ...emojiPicker, openPicker, setPosition }}
    >
      {children}
    </emojiPickerContext.Provider>
  );
}
