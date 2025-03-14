import { Loader } from "@components/loader/loader.component";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-full w-[calc(100%-320px)] absolute top-0 left-80">
      <Loader />
    </div>
  );
}
