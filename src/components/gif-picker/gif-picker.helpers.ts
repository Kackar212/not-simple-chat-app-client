import { COLUMN_WIDTH } from "./gif-picker.constants";
import { TenorGif } from "./gif-picker.types";

const MAX_HEIGHT = 400;

export const createPlaceholderGif = (): TenorGif => {
  const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  const height = Math.floor(
    Math.random() * (MAX_HEIGHT - COLUMN_WIDTH) + COLUMN_WIDTH
  );

  return {
    content_description: "",
    content_description_source: "",
    created: 0,
    flags: [],
    hasaudio: false,
    id: `${id}`,
    itemurl: "",
    media_formats: {
      tinymp4: {
        dims: [COLUMN_WIDTH, height],
        url: "",
        size: 0,
        preview: "",
        duration: 0,
      },
    },
    tags: [],
    title: "",
    url: "",
    isPlaceholder: true,
  };
};

export function debounce(callback: (...args: any[]) => void) {
  let debounceId = -1;

  return (...args: any[]) => {
    if (debounceId !== -1) {
      window.clearTimeout(debounceId);
    }

    debounceId = window.setTimeout(() => {
      callback(...args);

      debounceId = -1;
    }, 250);
  };
}
