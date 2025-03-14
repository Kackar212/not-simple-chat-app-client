export interface TenorGif {
  content_description: string;
  content_description_source: string;
  created: number;
  flags: string[];
  hasaudio: boolean;
  id: `${number}`;
  itemurl: string;
  media_formats: Record<
    string,
    {
      dims: number[];
      url: string;
      size: number;
      preview: string;
      duration: number;
    }
  >;
  tags: string[];
  title: string;
  url: string;
  isPlaceholder?: boolean;
}
