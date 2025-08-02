import { Dispatch, SetStateAction, createContext, useState } from "react";

export type NotificationType = "info" | "error" | "warning";

export const Context = createContext<
  | {
      notification: { message: string; type: NotificationType };
      setNotification: Dispatch<
        SetStateAction<{ message: string; type: NotificationType }>
      >;
    }
  | undefined
>(undefined);

export function Provider({ children }: { children: any }) {
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  }>({
    message: "",
    type: "info",
  });

  return (
    <Context.Provider
      value={{
        notification,
        setNotification,
      }}
    >
      {children}
    </Context.Provider>
  );
}
