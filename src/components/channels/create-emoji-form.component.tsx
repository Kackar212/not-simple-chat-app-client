import { Button } from "@components/button/button.component";
import { FormField } from "@components/form-field/form-field.component";
import { FormHeader } from "@components/form-header/form-header.component";
import { Form } from "@components/form/form.component";
import { Upload } from "@components/upload/upload.component";
import { useUpload } from "@components/upload/use-upload.hook";
import EmojiIcon from "/public/assets/icons/emoji.svg";
import { useForm, useFormContext } from "react-hook-form";
import { useMutation } from "@common/api/hooks/use-mutation.hook";
import { ApiError, mutations, QueryResponse } from "@common/api";
import { FormRadioField } from "@components/form-field/form-radio-field.component";
import PadlockOpenIcon from "/public/assets/icons/padlock-open.svg";
import PadlockClosedIcon from "/public/assets/icons/padlock-closed.svg";
import { useQueryClient } from "@tanstack/react-query";
import { CustomEmoji } from "@common/api/schemas/emoji.schema";
import { useSafeContext } from "@common/hooks";
import { authContext } from "@common/auth/auth.context";
import { EMOJIS_LIMIT } from "@common/constants";
import { twMerge } from "tailwind-merge";

interface CreateEmojiForm {
  serverName?: string;
  serverId?: number;
}

export function CreateEmojiForm({ serverName, serverId }: CreateEmojiForm) {
  const { file, isFileSelected, error, onFilesSelected, clearUploadHistory } =
    useUpload({
      name: "emoji",
      maxFileSize: 256 * 1024,
      useSchema: true,
    });

  const { handleSubmit, reset } = useFormContext();

  const {
    auth: { emojis },
  } = useSafeContext(authContext);

  const serverEmojisCount = emojis.filter(
    (emoji) => emoji.serverId === serverId
  ).length;

  const canEmojiBeCreated = serverEmojisCount < EMOJIS_LIMIT;

  const {
    mutate: createEmoji,
    isPending,
    data: { status },
  } = useMutation({
    mutationFn: mutations.createEmoji,
    onSuccess({ status: { isSuccess } }) {
      if (isSuccess) {
        reset();

        clearUploadHistory();
      }
    },
  });

  const onSubmit = handleSubmit(
    (data) => {
      if (!serverId || !canEmojiBeCreated) {
        return;
      }

      const requestData = {
        serverId,
        name: data.name,
        file: data.emoji,
        scope: data.scope,
      };

      createEmoji(requestData);
    },
    (error) => {
      console.log(error);
    }
  );

  return (
    <Form onSubmit={onSubmit} result={status}>
      {serverName && (
        <FormHeader Heading="h2">Create emoji in {serverName}</FormHeader>
      )}
      <p className="text-gray-330 max-w-[50ch] text-center mb-7 -mt-3">
        The best aspect ratio for emoji is 1:1 as they will be resized to be a
        square. The size limit is <strong>256 KB</strong>
      </p>
      <Upload
        label="Upload server emoji"
        name="emoji"
        onChange={onFilesSelected}
        file={file}
        isFileSelected={isFileSelected}
        error={error}
      />
      <fieldset className="w-full">
        <legend className="uppercase text-xs font-bold text-gray-360 mb-1">
          Scope
        </legend>
        <FormRadioField
          value="Public"
          name="scope"
          id="scope-public"
          label="Public"
          Icon={<PadlockOpenIcon className="size-6" />}
          description="Public emoji can be used on other servers"
        />
        <FormRadioField
          value="Private"
          name="scope"
          id="scope-private"
          label="Private"
          Icon={<PadlockClosedIcon className="size-6" />}
          description="Private emoji can only be used on this server"
        />
      </fieldset>
      <FormField
        name="name"
        label="name"
        Icon={<EmojiIcon />}
        hint={
          <span>
            You can use it and emoji id to insert emoji into a message without
            using emoji picker, eg: <strong>:custom_emoji_name_2:</strong> where
            2 is it id.
          </span>
        }
      />
      <div className="relative w-[calc(100%+64px)] left-0 -bottom-4 h-16 flex justify-between items-center px-8 bg-black-700">
        <span className={twMerge(!canEmojiBeCreated && "text-red-500")}>
          <span aria-hidden>
            {serverEmojisCount} / {EMOJIS_LIMIT}
          </span>
          <span className="sr-only" aria-live="polite">
            {canEmojiBeCreated
              ? `${serverEmojisCount} created, you can create ${
                  EMOJIS_LIMIT - serverEmojisCount
                } more`
              : "Limit reached"}
          </span>
        </span>
        <Button
          type="submit"
          aria-disabled={!canEmojiBeCreated}
          className="rounded-sm"
          isLoading={isPending}
        >
          Create emoji
        </Button>
      </div>
    </Form>
  );
}
