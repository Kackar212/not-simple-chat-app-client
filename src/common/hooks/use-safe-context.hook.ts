import { Context, useContext } from "react";

export function useSafeContext<ContextType>(context: Context<ContextType>) {
  const contextValue = useContext(context);

  if (contextValue === null) {
    throw new Error('Context is null, you can only access context inside its provider!');
  }

  return contextValue;
}
