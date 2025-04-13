import { getServer } from "@common/api";
import { Member } from "@common/api/schemas/member.schema";
import { Role } from "@common/api/schemas/role.schema";
import { Server } from "@common/api/schemas/server.schema";
import { AvatarSize, QueryKey } from "@common/constants";
import { Emoji } from "@common/emojis/emoji.class";
import { EmojiMemoryStorage } from "@common/emojis/emojis.storage";
import { Avatar } from "@components/avatar/avatar.component";
import {
  AutocompleteDataType,
  AutocompleteType,
} from "@components/input/use-editor.hook";
import { useQueryClient } from "@tanstack/react-query";
import { EditorView } from "codemirror";
import { CSSProperties, useCallback, useMemo } from "react";

interface UseAutocompleteProps {
  serverId?: number;
  editor?: EditorView;
  startIndex: number;
  cursorPosition: number;
  type: AutocompleteType;
}

export function useAutocomplete({
  serverId,
  editor,
  startIndex,
  cursorPosition,
  type,
}: UseAutocompleteProps) {
  const queryClient = useQueryClient();

  const members = useMemo(() => {
    const serverData = queryClient.getQueryData<
      Awaited<ReturnType<typeof getServer>>
    >(QueryKey.Server(serverId));

    if (!serverData) {
      return [];
    }

    const roles = serverData.data?.roles || [];
    const members = serverData.data?.members || [];

    return [...members, ...roles];
  }, [queryClient, serverId]);

  const data = useMemo(
    () =>
      type === AutocompleteDataType.Emojis
        ? EmojiMemoryStorage.getAll()
        : members,
    [members, type]
  );

  const keys = useMemo(
    () => ["profile.displayName", "user.username", "uniqueName", "id", "name"],
    []
  );

  const renderItem = useCallback((item: Member | Emoji | Role) => {
    if ("profile" in item) {
      return (
        <span className="flex items-center gap-1">
          <Avatar size={AvatarSize.XS} src={item.profile.avatar} />
          {item.profile.displayName}
        </span>
      );
    }

    if ("color" in item) {
      return (
        <span
          className="color-(--color)"
          style={{ "--color": item.color } as CSSProperties}
        >
          @{item.name}
        </span>
      );
    }

    if (item instanceof Emoji) {
      return (
        <span className="flex items-center gap-1">
          <img src={item.url} alt="" width={16} height={16} />
          <span>:{item.uniqueName}:</span>
        </span>
      );
    }

    return;
  }, []);

  const onSelect = useCallback(
    (value: Member | Emoji | Role) => {
      editor?.dispatch({
        changes: {
          from: startIndex,
          to: cursorPosition,
          insert:
            value instanceof Emoji
              ? `:${value.uniqueName}:`
              : `<@${"name" in value ? "&" : ""}${value.id}>`,
        },
      });
    },
    [cursorPosition, editor, startIndex]
  );

  const getKey = useCallback((item: Member | Emoji | Role) => {
    const hasId = "id" in item && item.id;
    const isEmoji = item instanceof Emoji;

    if (isEmoji && !hasId) {
      return item.uniqueName;
    }

    if ("name" in item) {
      return item.name;
    }

    return item.id!;
  }, []);

  return { data, keys, onSelect, renderItem, getKey };
}
