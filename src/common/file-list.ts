const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

class _FileList extends Array {
  length: number = 0;
}

export const classes = {
  FileList: isBrowser ? globalThis.FileList : _FileList,
}
