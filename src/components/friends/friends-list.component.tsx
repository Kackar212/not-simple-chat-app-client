import Loading from "@/app/loading";
import { Friend as FriendEntity } from "@common/api/schemas/friend.schema";
import { FriendStatus } from "@common/enums/friend-status.enum";
import { plural } from "@common/utils";
import { Friend } from "@components/friend/friend.component";
import { Loader } from "@components/loader/loader.component";
import { AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface FriendsListProps {
  isLoading: boolean;
  status?: FriendStatus;
  friendsCount?: number;
  children: ReactNode;
}

export function FriendsList({
  isLoading,
  status,
  friendsCount = 0,
  children,
}: FriendsListProps) {
  return (
    <div>
      <h2 className="px-20 text-xs uppercase text-gray-360 font-semibold mt-4 pb-2 flex justify-between">
        <span aria-hidden>
          {!status && `All friends`}
          {status === FriendStatus.Blocked && "Blocked users"}
          {status === FriendStatus.Pending && "Pending friend requests"}
          {status === FriendStatus.Online && "Online friends"} — {friendsCount}
        </span>
        {!status && <span aria-hidden>{friendsCount} / 50</span>}
        <span className="sr-only lowercase first-letter:capitalize">
          <span>
            You have {friendsCount} {status?.toLowerCase()}
            {plural.friend(friendsCount)}
            {!status && <span>, you can have {50 - friendsCount} more.</span>}
          </span>
        </span>
      </h2>
      <div className="mx-20 h-[1px] bg-black-300"></div>
      {isLoading && (
        <div className="flex size-full justify-center items-center">
          <Loader />
        </div>
      )}
      <AnimatePresence>
        <ul className="px-[4.5rem] py-2 w-full relative">{children}</ul>
      </AnimatePresence>
    </div>
  );
}
