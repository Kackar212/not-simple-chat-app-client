import { useRef, useState } from "react";

type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;

export function useOptimistic<
  State extends Array<any>,
  Item extends Partial<Flatten<State>>
>(
  initialState: State,
  updateFn: (
    state: Item[],
    item: Item
  ) => {
    update(updateItem?: Item): Item[];
    undo(): Item[];
  }
): [
  Item[],
  (item: Item) => {
    update(): void;
    undo(): void;
  }
] {
  const [optimisticState, setOptimisticState] = useState<Item[]>(initialState);

  return [
    optimisticState,
    (item: Item) => {
      const { update, undo } = updateFn(optimisticState, item);

      return {
        update(updateItem: Item = item) {
          setOptimisticState(update(updateItem));
        },
        undo() {
          setOptimisticState(undo());
        },
      };
    },
  ];
}
