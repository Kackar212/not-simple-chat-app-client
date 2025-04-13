import { Link } from "@components/link/link.component";
import { Sidebar } from "../sidebar.component";

interface ServerSettingsProps {
  params: Promise<{
    serverId: string;
  }>;
}

export default async function ServerSettings({ params }: ServerSettingsProps) {
  const { serverId } = await params;
  const listItemClassName = " ";
  const linkClassName =
    "px-2.5 py-1.5 h-8 hover:bg-gray-240/30 w-full flex leading-5 aria-[current=page]:bg-gray-240/60 aria-[current=page]:text-white-500 rounded-sm";

  return (
    <section className="w-full h-full">
      <h1 className="sr-only">Server settings</h1>
      <div className="flex gap-[clamp(1rem,20vw,2.5rem)] h-full">
        <Sidebar serverId={serverId}>
          <ul className="flex flex-col gap-1">
            <li className={listItemClassName}>
              <Link href={`settings/${serverId}`} className={linkClassName}>
                Server Profile
              </Link>
            </li>
          </ul>
          <hr className="mt-4 border-black-560" />
          <h2 className="px-2.5 text-xs font-bold uppercase text-gray-150 mt-4 mb-2">
            People
          </h2>
          <ul className="flex flex-col gap-1">
            <li className={listItemClassName}>
              <a href={`${serverId}/roles`}>ssss</a>
              <Link href={`${serverId}/roles`} className={linkClassName}>
                Roles
              </Link>
            </li>
            <li className={listItemClassName}>
              <Link href="/members" className={linkClassName}>
                Members
              </Link>
            </li>
            <li className={listItemClassName}>
              <Link href="/invites" className={linkClassName}>
                Invites
              </Link>
            </li>
          </ul>
          <hr className="mt-4 border-black-560" />
          <h2 className="px-2.5 text-xs font-bold uppercase text-gray-150 mt-4 mb-2">
            Emojis
          </h2>
          <ul className="flex flex-col gap-1">
            <li className={listItemClassName}>
              <Link href="create-emojis" className={linkClassName}>
                Create emoji
              </Link>
            </li>
            <li className={listItemClassName}>
              <Link href="manage-emojis" className={linkClassName}>
                Manage emojis
              </Link>
            </li>
          </ul>
        </Sidebar>
        <section className="flex-[1_1_500px] justify-start max-h-full py-4 pt-14 pr-[clamp(1rem,20vw,2.5rem)]">
          <div className="max-w-3xl">
            <h2 className="text-3xl text-white-500 font-semibold">Options</h2>
            <hr className="mt-4 border-black-500" />
          </div>
        </section>
      </div>
    </section>
  );
}
