import { Settings } from "@components/settings/settings.component";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useReducer,
  useState,
} from "react";

const defaultContext = {
  isSettingsPanelOpen: false,
  isSidebarOpen: false,
};

type Action = { type: "TOGGLE_CHANNELS" } | { type: "TOGGLE_DIRECT_MESSAGES" };

function reducer(state: typeof defaultContext, action: Action) {
  switch (action.type) {
    case "TOGGLE_CHANNELS": {
      return {
        ...state,
        isSidebarOpen: !state.isSidebarOpen,
      };
    }

    case "TOGGLE_DIRECT_MESSAGES": {
      return {
        ...state,
        isSidebarOpen: state.isSidebarOpen,
      };
    }

    default: {
      return state;
    }
  }
}

export const layoutContext = createContext<
  typeof defaultContext & { dispatch: Dispatch<Action> }
>({ ...defaultContext, dispatch() {} });

export function LayoutProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, defaultContext);

  return (
    <layoutContext.Provider value={{ ...state, dispatch }}>
      {children}
    </layoutContext.Provider>
  );
}
