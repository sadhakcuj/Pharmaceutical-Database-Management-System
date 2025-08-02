import { useContext } from "react";
import { NotificationContext } from "./contexts";
import { NotificationType } from "./contexts/notification";

export function useNotification() {
  const ctx = useContext(NotificationContext);
  return {
    notification: ctx ? ctx.notification.message : "",
    pushNotification: (message: string, type: NotificationType = "info") => {
      if (ctx?.setNotification) {
        ctx.setNotification({ message: message.toString(), type });
      }
    },
  };
}
