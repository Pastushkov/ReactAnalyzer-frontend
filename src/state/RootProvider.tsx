import { useState } from "react";
import { RootContext } from "./rootContext";

interface Props {
  children: React.ReactNode;
}

export const RootProvider = ({ children }: Props) => {
  const [code, setCode] = useState<string>("");
  return (
    <RootContext.Provider
      value={{
        state: { code },
        actions: { setCode },
      }}
    >
      {children}
    </RootContext.Provider>
  );
};
