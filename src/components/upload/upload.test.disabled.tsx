import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Upload, UploadProps } from "./upload.component";
import { FormProvider, useForm } from "react-hook-form";
import { useUpload, UseUploadProps } from "./use-upload.hook";

interface TestComponentProps {}

function TestCompoentInner(
  props: UseUploadProps<{}> & UploadProps<"file", {}>
) {
  const { file, isFileSelected, error, onFilesSelected } = useUpload(props);

  return (
    <Upload
      label="Upload"
      onChange={onFilesSelected}
      error={error}
      file={file}
      isFileSelected={isFileSelected}
      {...props}
    />
  );
}

function TestComponent(props: UseUploadProps<{}> & UploadProps<"file", {}>) {
  return (
    <FormProvider {...useForm()}>
      <TestCompoentInner {...props} />
    </FormProvider>
  );
}

describe("Upload", () => {
  it("should allow user to upload single file", async () => {
    const upload = await render(<TestComponent name="files" />);

    const uploadInput = upload.getByLabelText(/Upload/i) as HTMLInputElement;

    await userEvent.upload(uploadInput, new File([], "test-file.txt"));

    const file = uploadInput.files?.[0];

    expect(file?.name).toBe("test-file.txt");
  });

  it("should allow user to upload multiple files if multiple property is set to true", async () => {
    const upload = await render(<TestComponent name="files" multiple />);

    const uploadInput = upload.getByLabelText(/Upload/i) as HTMLInputElement;

    await userEvent.upload(uploadInput, [
      new File([], "test-file0.txt"),
      new File([], "test-file1.txt"),
      new File([], "test-file2.txt"),
    ]);

    const files = [...(uploadInput.files || [])];

    const hasFiles = files.every(
      (file, index) => file.name === `test-file${index}.txt`
    );

    expect(hasFiles).toBe(true);
  });

  it("should display error if specified", () => {});
});
