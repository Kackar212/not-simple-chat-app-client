import { ArrowIcon } from "@components/icons/arrow.icon";
import { TextLink } from "@components/link/text-link.component";

export function NotFound() {
  return (
    <div className="flex w-full h-screen justify-center bg-black-600 items-center">
      <div className="p-4 flex flex-col items-start gap-4 text-white-500 rounded-lg">
        <TextLink
          href="/channels/me/friends"
          className="flex gap-2 items-center"
        >
          <ArrowIcon /> Return
        </TextLink>
        <div className="text-center p-8 py-12 text-white-500 border-t-2 border-black-630">
          <h2 className="text-[clamp(1rem,5vw,4rem)] font-bold">
            404 Not Found
          </h2>
          <p className="text-[clamp(0.75rem,5vw,2rem)]">
            We could not find the requested resource
          </p>
        </div>
      </div>
    </div>
  );
}
