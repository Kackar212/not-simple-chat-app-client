import { mutations } from "@common/api";
import { useMutation } from "@common/api/hooks/use-mutation.hook";
import { Button } from "@components/button/button.component";
import { useCallback } from "react";

interface DirectMessageRequestProps {
  channelId: number;
  messageId: number;
}

export function DirectMessageRequest({
  channelId,
  messageId,
}: DirectMessageRequestProps) {
  const { mutate: accept, isPending } = useMutation({
    mutationFn: mutations.acceptDirectMessageRequest,
  });

  const { mutate: decline } = useMutation({
    mutationFn: mutations.declineDirectMessageRequest,
  });

  const acceptDirectMessageRequest = useCallback(() => {
    accept({ messageId, channelId });
  }, [accept, channelId, messageId]);

  const declineDirectMessageRequest = useCallback(() => {
    decline({ messageId, channelId });
  }, [decline, messageId, channelId]);

  return (
    <div className="flex p-3 rounded-md bg-black-660 w-fit max-w-prose flex-col">
      <span className="text-sm font-semibold mb-3 leading-none">
        Hi! Do you want to start private chat with me?
      </span>
      <div className="flex gap-2">
        <Button
          isLoading={isPending}
          onClick={acceptDirectMessageRequest}
          className="text-sm bg-green-700 hover:bg-green-800"
        >
          Accept
        </Button>
        <Button
          className="text-sm bg-red-500 hover:bg-red-700"
          onClick={acceptDirectMessageRequest}
        >
          Decline
        </Button>
      </div>
    </div>
  );
}
