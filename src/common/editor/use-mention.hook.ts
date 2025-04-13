import {
  Decoration,
  DecorationSet,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { getServer } from "@common/api";
import { Member } from "@common/api/schemas/member.schema";
import { QueryKey } from "@common/constants";
import { useSafeContext } from "@common/hooks";
import { chatContext } from "@components/chat/chat.context";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useCallback, useMemo, useRef } from "react";
import { getAutocompleteState, RegEx, Tag, UsePluginProps } from "./utils";
import { AutocompleteState } from "@components/input/use-editor.hook";
import { Role } from "@common/api/schemas/role.schema";

class MentionWidget extends WidgetType {
  constructor(private readonly member: Member | Role | "@everyone" | "@here") {
    super();
  }

  eq(other: MentionWidget) {
    if (typeof this.member !== "string" && typeof other.member !== "string") {
      return other.member.id === this.member.id;
    }

    if (other.member === this.member) {
      return true;
    }

    return false;
  }

  #getText() {
    if (typeof this.member === "string") {
      return this.member.substring(1);
    }

    if ("profile" in this.member) {
      return this.member.profile.displayName;
    }

    return this.member.name;
  }

  toDOM() {
    const template = document.createElement("div");
    const text = this.#getText();

    template.innerHTML = `
      <span class="cm-mention">@${text}</span>
    `;

    return template.firstElementChild as HTMLElement;
  }
}

export function useMention({ setAutocompleteState }: UsePluginProps) {
  const { members, roles } = useSafeContext(chatContext);

  // const autocomplete = useCallback(
  //   (update: ViewUpdate) => {
  //     console.log(
  //       getAutocompleteState(update, Tag.Mention, `<${Tag.Mention}\\d+>`)
  //     );
  //     setAutocompleteState((prevState) => ({
  //       ...prevState,
  //       ...getAutocompleteState(update, Tag.Mention, RegEx.Mention),
  //       type: "Members",
  //     }));
  //   },
  //   [setAutocompleteState]
  // );

  const createPlugin = useCallback(
    (matcher: MatchDecorator) =>
      ViewPlugin.fromClass(
        class {
          mentions: DecorationSet;
          constructor(view: EditorView) {
            this.mentions = matcher.createDeco(view);
          }
          update(update: ViewUpdate) {
            this.mentions = matcher.updateDeco(update, this.mentions);
          }
        },
        {
          decorations: (instance) => instance.mentions,
          provide: (plugin) =>
            EditorView.atomicRanges.of((view) => {
              return view.plugin(plugin)?.mentions || Decoration.none;
            }),
        }
      ),
    []
  );

  const mentionMatcher = useMemo(
    () =>
      new MatchDecorator({
        regexp: /<@\&?!?(\d+)>|(@(?:(everyone|here))(?=\s))/g,
        decoration: (match) => {
          const member = members.find(({ id }) => Number(match[1]) === id);
          const role = roles.find(({ id }) => Number(match[1]) === id);

          const mention = member || role;

          if (match[0] === "@everyone" || match[0] === "@here") {
            return Decoration.replace({
              widget: new MentionWidget(match[0]),
            });
          }

          if (!mention) {
            return null;
          }

          return Decoration.replace({
            widget: new MentionWidget(mention),
          });
        },
      }),
    [members, roles]
  );

  const mentions = useMemo(
    () => createPlugin(mentionMatcher),
    [mentionMatcher, createPlugin]
  );

  return { mentions };
}
