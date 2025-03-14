import { MemberRoles } from "@components/member/member-roles.component";
import { useGetProfile } from "@components/member/use-get-profile.hook";
import { ProfileHeader } from "@components/profile-header/profile-header.component";
import { format } from "date-fns";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { Mutual } from "./mutual.component";
import { PropsWithChildren } from "react";
import { Loader } from "@components/loader/loader.component";
import { ProfileSkeleton } from "@components/skeleton/profile-skeleton.component";

interface MemberProfileRootProps {
  isOpen: boolean;
  userId: number;
  serverId?: number;
  isCurrentUser?: boolean;
}

export function MemberProfileRoot({
  userId,
  serverId,
  isOpen,
  isCurrentUser,
  children,
}: PropsWithChildren<MemberProfileRootProps>) {
  const {
    data: profile,
    queryKey,
    isLoading,
  } = useGetProfile({
    userId,
    serverId,
    isOpen: isOpen && userId !== -1,
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return null;
  }

  const {
    mutualFriends,
    mutualServers,
    user,
    isFriend,
    isInvited,
    hasFriendRequest,
    friend,
  } = profile;

  const profileHeader = children ? (
    children
  ) : (
    <ProfileHeader
      user={user}
      isCurrentUser={isCurrentUser}
      isFriend={isFriend}
      isInvited={isInvited}
      hasFriendRequest={hasFriendRequest}
      queryKey={queryKey}
      friend={friend}
      openProfile={open}
      inModal={true}
    />
  );

  const mutualServersCount =
    mutualServers.length > 0 ? mutualServers.length : "No";
  const mutualFriendsCount =
    mutualFriends.length > 0 ? mutualFriends.length : "No";

  const formattedDate = format(user.createdAt, "dd MMM, y");
  const joinedServerAt =
    user.joinedServerAt && format(user.joinedServerAt, "dd MMM, y");

  return (
    <>
      {profileHeader}
      <Tabs className="p-4 m-4 bg-black-660 rounded-md text-white-500 tabs">
        <TabList className="flex border-b border-b-black-450 gap-6 mb-4">
          <Tab className="focus:focus-default text-sm p-2 cursor-pointer capitalize rounded-t-sm border-b border-transparent hover:bg-gray-260/30">
            General
          </Tab>
          {!isCurrentUser && (
            <>
              <Tab className="focus:focus-default text-sm p-2 cursor-pointer capitalize rounded-t-sm border-b border-transparent hover:bg-gray-260/30">
                {mutualFriendsCount} Mutual friends
              </Tab>
              <Tab className="focus:focus-default text-sm p-2 cursor-pointer capitalize rounded-t-sm border-b border-transparent hover:bg-gray-260/30">
                {mutualServersCount} Mutual servers
              </Tab>
            </>
          )}
        </TabList>

        <TabPanel>
          <MemberRoles roles={user.roles} className="mt-0" />
          <div className="mb-6 last:mb-0">
            <h3 className="text-xs my-1 font-medium">Member since</h3>
            <div className="flex gap-2 items-center">
              <time className="text-xs" dateTime={user.createdAt}>
                {formattedDate}
              </time>
              {joinedServerAt && (
                <>
                  <span className="flex size-1 rounded-[50%] bg-white-0"></span>
                  <time className="text-xs" dateTime={user.joinedServerAt}>
                    {joinedServerAt}
                  </time>
                </>
              )}
            </div>
          </div>
          {!!user.description && (
            <div className="mb-6 last:mb-0">
              <h3 className="text-xs mb-0.5 font-medium">About me</h3>
              <p className="text-sm">{user.description}</p>
            </div>
          )}
        </TabPanel>
        {!isCurrentUser && (
          <>
            <TabPanel>
              {mutualFriends.length === 0 && (
                <p className="text-gray-150">
                  There are no friends in common with {user.displayName}
                </p>
              )}
              {mutualFriends.map(
                ({
                  user: { id, displayName, avatar, status },
                  privateChannelId,
                }) => (
                  <Mutual
                    key={id}
                    channelId={privateChannelId}
                    src={avatar}
                    name={displayName}
                    displayName={status}
                    iconPlaceholder="data:image/${string};base64,"
                  />
                )
              )}
            </TabPanel>
            <TabPanel>
              {mutualServers.length === 0 && (
                <p className="text-gray-150">
                  There are no servers in common with {user.displayName}
                </p>
              )}
              {mutualServers.map(
                ({
                  id,
                  serverIcon,
                  name,
                  members: [{ profile }],
                  channels: [channel],
                }) => (
                  <Mutual
                    key={id}
                    id={id}
                    channelId={channel?.id}
                    src={serverIcon}
                    name={name}
                    displayName={profile.displayName}
                  />
                )
              )}
            </TabPanel>
          </>
        )}
      </Tabs>
    </>
  );
}
