import WaveSurfer from "wavesurfer.js";

declare global {
  interface CustomEventMap {
    audio_volume: CustomEvent<{ audioVolume: number }>;
    speaking: CustomEvent<{
      isSpeaking: boolean;
      remote: boolean;
      username: string;
    }>;
    voiceactivation: CustomEvent<{
      isSpeaking: boolean;
    }>;
    recorderdata: CustomEvent<{ blob: Blob }>;
  }
}

declare global {
  interface Document {
    //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => any
    ): void;
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
  }

  interface Window {
    //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => any
    ): void;
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
  }

  interface HTMLAudioElement {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => any
    ): void;
  }
}

interface EmEmojiProps {
  id?: string;
  shortcodes?: string;
  native?: string;
  size?: string;
  fallback?: string;
  set?: "native" | "apple" | "facebook" | "google" | "twitter";
  skin?: 1 | 2 | 3 | 4 | 5 | 6;
}
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "em-emoji": EmEmojiProps;
    }
  }
}

export {};
