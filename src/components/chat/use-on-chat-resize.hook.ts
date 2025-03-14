import {
  EventHandler,
  MutableRefObject,
  SyntheticEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  WheelEventHandler,
} from "react";
import { useResizeDetector } from "react-resize-detector";

interface UseOnChatResizeProps {
  scrollInnerRef: MutableRefObject<HTMLElement | null>;
  scrollerRef: MutableRefObject<HTMLElement | null>;
}

export function useOnChatResize({
  scrollInnerRef,
  scrollerRef,
}: UseOnChatResizeProps) {
  const isScrollEventDispatchedByResize = useRef(false);
  const shouldScrollToBottom = useRef(false);

  const onResize = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    if (shouldScrollToBottom.current) {
      return;
    }

    isScrollEventDispatchedByResize.current = true;
    scroller.scrollTop = scroller.scrollHeight - scroller.clientHeight;
  }, [scrollerRef]);

  useResizeDetector({
    onResize,
    handleHeight: true,
    handleWidth: false,
    targetRef: scrollInnerRef,
  });

  useResizeDetector({
    onResize,
    handleHeight: true,
    handleWidth: false,
    targetRef: scrollerRef,
  });

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const onScroll = () => {
      if (isScrollEventDispatchedByResize.current) {
        isScrollEventDispatchedByResize.current = false;

        return;
      }

      shouldScrollToBottom.current =
        scroller.scrollTop != scroller.scrollHeight - scroller.clientHeight;
    };

    scroller.addEventListener("scroll", onScroll);

    return () => {
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [scrollerRef]);
}
