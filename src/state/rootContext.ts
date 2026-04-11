import { createContext, useContext } from "react";

interface RootState {
  code: string;
}

interface RootActions {
  setCode: (code: string) => void;
}

interface RootCtx {
  state: RootState;
  actions: RootActions;
}

export const RootContext = createContext<RootCtx | null>(null);

export const useRootContext = () => {
  const context = useContext(RootContext);
  if (!context) {
    throw new Error("useRootContext must be used within a RootProvider");
  }
  return context;
};
