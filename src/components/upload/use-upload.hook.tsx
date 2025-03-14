import { AttachmentType } from "@common/enums/attachment-type.enum";
import { getFileSizeWithUnit } from "@common/utils";
import { FormEvent, useCallback, useRef, useState } from "react";
import { get, useFormContext } from "react-hook-form";
import { mapFileToHistoryFile } from "./use-upload.utils";
import { HistoryFile } from "./history-file.interface";

export interface UseUploadProps<CustomData extends Record<string, unknown>> {
  name: string;
  maxFileSize?: number;
  maxFilesSize?: number;
  useSchema?: boolean;
  onError?: () => void;
  onChange?: (history: {
    files: HistoryFile<CustomData>[];
    size: number;
  }) => void;
}

export function useUpload<CustomData extends Record<string, unknown>>({
  name,
  maxFileSize = 1024 * 512,
  maxFilesSize = Math.pow(1024, 2) * 3,
  useSchema = false,
  onError = () => {},
  onChange = () => {},
}: UseUploadProps<CustomData>) {
  const formContext = useFormContext();
  const {
    register,
    setError,
    resetField,
    clearErrors,
    formState: { errors },
  } = formContext;
  const [history, setHistory] = useState<{
    files: HistoryFile<CustomData>[];
    size: number;
  }>({ files: [], size: 0 });
  const error = get(errors, name);
  const file = history.files[0];
  const isFileSelected = !!file;
  const isTooBig = useRef(false);
  const isFileTooBig = useRef(false);
  const { trigger, setValue } = useFormContext();

  const transformFile = useCallback(
    async (file: File, customData: CustomData) => {
      return {
        ...(await mapFileToHistoryFile(file)),
        remove() {
          setHistory(({ files: history, size }) => ({
            files: history.filter((historyFile) => historyFile.file !== file),
            size: size - file.size,
          }));
        },
        update(obj: CustomData) {
          setHistory(({ files: history, size }) => ({
            files: history.map((historyFile) => {
              if (historyFile.file !== file) {
                return historyFile;
              }

              return {
                ...historyFile,
                customData: {
                  ...customData,
                  ...obj,
                },
              };
            }),
            size,
          }));
        },
        customData,
      };
    },
    []
  );

  const onFilesSelected = useCallback(
    async (event: FormEvent<HTMLInputElement>) => {
      const { target: input } = event;
      const isInput = input instanceof HTMLInputElement;

      if (!isInput) {
        return history.files;
      }

      const { multiple } = input;

      if (
        input.files?.length === 0 &&
        history.files.length !== 0 &&
        !multiple
      ) {
        setHistory({ files: [], size: 0 });

        return history.files;
      }

      if (!input.files || input.files.length === 0) {
        return history.files;
      }

      const files = [...input.files];

      input.value = "";

      const tooLargeFile = files.find((file) => file.size > maxFileSize);
      isFileTooBig.current = !!tooLargeFile;

      const customData = {} as CustomData;

      if (isFileTooBig.current) {
        onError();
      }

      if (isFileTooBig.current && !useSchema) {
        setError(name, {
          message: `Single file must be less than ${getFileSizeWithUnit(
            maxFileSize
          )}`,
        });
        return history.files;
      }

      if (isFileTooBig.current) {
        setValue(name, tooLargeFile, { shouldValidate: true });

        return history.files;
      }

      const fileNames = history.files.map((file) => file.name);

      const newFiles = await Promise.all(
        files
          .filter(({ size }) => size > 0)
          .filter((file) => !fileNames.includes(file.name))
          .map((file) => transformFile(file, customData))
      );

      if (newFiles.length === 0) {
        return history.files;
      }

      const newTotalSize = newFiles.reduce(
        (result, { file }) => result + file.size,
        history.size
      );

      isTooBig.current = newTotalSize > maxFilesSize;

      if (isTooBig.current) {
        onError();
      }

      if (isTooBig.current && !useSchema) {
        setError(name, {
          message: `All attachments must be less than ${getFileSizeWithUnit(
            maxFilesSize
          )}`,
        });

        return history.files;
      }

      const newHistoryFiles = multiple
        ? [...history.files, ...newFiles]
        : [...newFiles];

      if (isTooBig.current) {
        setValue(name, newHistoryFiles, { shouldValidate: true });

        return history.files;
      }

      const newHistory = { files: newHistoryFiles, size: newTotalSize };
      setHistory(newHistory);
      onChange(newHistory);
      clearErrors(name);

      return newHistoryFiles;
    },
    [
      history.files,
      history.size,
      maxFileSize,
      maxFilesSize,
      name,
      onChange,
      onError,
      setError,
      setValue,
      clearErrors,
      useSchema,
      transformFile,
    ]
  );

  const updateHistory = useCallback(
    async (files: File[], customData: CustomData) => {
      const newFiles = await Promise.all(
        files.map((file) => transformFile(file, customData))
      );

      setHistory(({ files: history, size }) => ({
        files: [...history, ...newFiles],
        size: size + files.reduce((sum, file) => sum + file.size, 0),
      }));

      return newFiles;
    },
    [transformFile]
  );

  const clearUploadHistory = useCallback(() => {
    setHistory({ files: [], size: 0 });
  }, []);

  const uploadProps = register(name, { onChange: onFilesSelected });

  return {
    uploadProps,
    file: isFileTooBig.current ? undefined : file,
    isFileSelected: isFileTooBig.current ? false : isFileSelected,
    error,
    history,
    isTooBig: isTooBig.current,
    onFilesSelected,
    setHistory,
    clearUploadHistory,
    maxFilesSize: Math.floor(maxFilesSize / Math.pow(1024, 2)),
    transformFile,
    updateHistory,
  };
}
