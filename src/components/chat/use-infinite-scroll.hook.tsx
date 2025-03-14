import { Direction } from "@common/api/hooks";
import { useSafeContext } from "@common/hooks";
import {
  FetchNextPageOptions,
  FetchPreviousPageOptions,
} from "@tanstack/react-query";
import { MutableRefObject, useEffect, useRef } from "react";
import { IntersectionOptions, useInView } from "react-intersection-observer";
import { chatContext } from "./chat.context";

interface UseInfiniteScrollProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<any>;
  fetchPreviousPage: (options?: FetchPreviousPageOptions) => Promise<any>;
  afterFetchOnDispatch: (direction: Direction) => void;
  intersectionOptions?: IntersectionOptions;
}

const lastScrollPosition: Record<number, number> = {};

export function useInfiniteScroll({
  hasNextPage,
  hasPreviousPage,
  fetchNextPage,
  fetchPreviousPage,
  afterFetchOnDispatch,
  intersectionOptions = {
    rootMargin: "700px 0px 700px 0px",
    threshold: 0.25,
  },
}: UseInfiniteScrollProps) {
  const { scrollContainerRef, channelId } = useSafeContext(chatContext);
  const isMouseOnScroll = useRef(false);
  const fetchingNextPage = useRef(false);
  const fetchingPreviousPage = useRef(false);

  const scrollContainer =
    (intersectionOptions.root as HTMLElement) || scrollContainerRef.current;
  const intersectionObserverOptions = {
    root: scrollContainer,
    ...intersectionOptions,
  };

  const { ref, inView } = useInView(intersectionObserverOptions);
  const { ref: bottomRef, inView: inViewBottom } = useInView(
    intersectionObserverOptions
  );

  useEffect(() => {
    if (!scrollContainer) {
      return;
    }

    let timeout = -1;

    const onScroll = async (isDispatched: boolean | Event) => {
      if (isDispatched instanceof Event) {
        lastScrollPosition[channelId] = scrollContainer.scrollTop;
      }

      if (
        (!inView && !inViewBottom) ||
        fetchingNextPage.current ||
        fetchingPreviousPage.current ||
        isMouseOnScroll.current
      ) {
        return;
      }

      if (timeout !== -1) {
        return;
      }

      timeout = window.setTimeout(async () => {
        let direction;

        if (inView && hasNextPage && !fetchingPreviousPage.current) {
          fetchingNextPage.current = true;

          await fetchNextPage();

          direction = Direction.Next;
        }

        if (inViewBottom && hasPreviousPage && !fetchingNextPage.current) {
          fetchingPreviousPage.current = true;

          await fetchPreviousPage();

          direction = Direction.Previous;
        }

        if (isDispatched === true && direction) {
          afterFetchOnDispatch(direction);
        }

        setTimeout(() => {
          fetchingNextPage.current = false;
          fetchingPreviousPage.current = false;

          timeout = -1;
        }, 150);
      }, 150);
    };

    scrollContainer.addEventListener("scroll", onScroll);

    const onMouseDown = ({ offsetX }: MouseEvent) => {
      isMouseOnScroll.current = scrollContainer.clientWidth < offsetX;
    };

    scrollContainer.addEventListener("mousedown", onMouseDown);

    const onMouseUp = async () => {
      if (!isMouseOnScroll.current) {
        return;
      }

      isMouseOnScroll.current = false;
      onScroll(true);
    };

    scrollContainer.addEventListener("mouseup", onMouseUp);

    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
      scrollContainer.removeEventListener("mousedown", onMouseDown);
      scrollContainer.removeEventListener("mouseup", onMouseUp);
    };
  }, [
    afterFetchOnDispatch,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    inView,
    inViewBottom,
    scrollContainer,
    channelId,
  ]);

  return {
    inView,
    inViewBottom,
    ref,
    bottomRef,
    lastScrollPosition,
  };
}
