import { Friends } from "@components/friends/friends.component";
import { redirect } from "next/navigation";

export default async function DirectMessagesPage() {
  redirect("/channels/me/friends");
}
