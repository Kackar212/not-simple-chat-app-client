import { getQueryClient } from "@/app/get-query-client";
import { ApiError, mutations, QueryResponse } from "@common/api";
import { revalidateQuery } from "@common/api/api.actions";
import { UserServer } from "@common/api/schemas/server.schema";
import { UPLOAD_ICON_ALLOWED_MIME_TYPES } from "@common/constants";
import { Button } from "@components/button/button.component";
import { FormField } from "@components/form-field/form-field.component";
import { FormHeader } from "@components/form-header/form-header.component";
import { Form } from "@components/form/form.component";
import { HashTagIcon } from "@components/icons";
import { Upload } from "@components/upload/upload.component";
import { useUpload } from "@components/upload/use-upload.hook";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";

interface CreateServerFormProps {
  close: () => void;
}

const UPLOAD_INPUT_ACCEPT = UPLOAD_ICON_ALLOWED_MIME_TYPES.join(", ");

export function CreateServerForm({ close }: CreateServerFormProps) {
  const { file, isFileSelected, error, onFilesSelected } = useUpload({
    name: "serverIcon",
    maxFileSize: 256 * 1024,
    useSchema: true,
  });

  const queryClient = useQueryClient();

  const { mutateAsync: createServer, data } = useMutation({
    mutationFn: mutations.createServer,
  });

  const useFormData = useFormContext();

  const onSubmit = useFormData.handleSubmit(async (data) => {
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      return;
    }

    const {
      data: createdServer,
      status: { isSuccess },
    } = await createServer({
      name: data.name,
      serverIcon: file,
    });

    if (!isSuccess) {
      return;
    }

    useFormData.reset();

    queryClient.setQueryData(
      ["get-user-servers"],
      (old: QueryResponse<UserServer[], ApiError>) => {
        const { data: oldServers = [] } = old;

        return {
          ...old,
          data: [...oldServers, createdServer],
        };
      }
    );

    queryClient.invalidateQueries({ queryKey: ["get-user-servers"] });

    close();
  });

  return (
    <Form
      className="min-w-[20rem] m-auto"
      onSubmit={onSubmit}
      result={data?.status}
    >
      <FormHeader Heading="h2">Create your server!</FormHeader>
      <p className="text-gray-330 max-w-[50ch] text-center -mt-2 mb-6">
        Give your new server a personality with a name and an icon. You can
        always change it later.
      </p>
      <Upload
        label="Upload server icon"
        name="serverIcon"
        onChange={onFilesSelected}
        error={error}
        file={file}
        isFileSelected={isFileSelected}
        accept={UPLOAD_INPUT_ACCEPT}
      />
      <div className="w-full">
        <FormField
          type="text"
          name="name"
          label="Server name"
          Icon={<HashTagIcon />}
        />
        <Button type="submit">
          Create <span className="sr-only">server</span>
        </Button>
      </div>
    </Form>
  );
}
