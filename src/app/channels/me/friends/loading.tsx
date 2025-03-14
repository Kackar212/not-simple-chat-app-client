import { Loader } from "@components/loader/loader.component";

export default function Loading() {
  return (
    <div className="flex justify-center items-center size-full absolute left-0 top-0">
      <Loader />
    </div>
  );
}
