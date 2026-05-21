import { useEffect } from "react";
import io from "socket.io-client";
import {
  requestNotificationPermission,
  showMessageNotification,
} from "../utility/notifications";

const socket = io(
  import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_BASE_URL ||
    "http://localhost:7000",
  { transports: ["websocket"] }
);

const GlobalMessageNotifications = () => {
  useEffect(() => {
    const syncSocketUser = () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) return;

      socket.emit("register_user", userId);
      socket.emit("join_room", userId);
    };

    const askForNotifications = () => {
      requestNotificationPermission();
    };

    const handleReceiveMessage = (message) => {
      const userId = localStorage.getItem("userId");
      if (!userId || message.receiverId !== userId) return;

      window.dispatchEvent(
        new CustomEvent("incomingMessage", { detail: message })
      );
      const activeChatPaths = [
        `/chat/${message.receiverId}/${message.senderId}`,
        `/chat/${message.senderId}/${message.receiverId}`,
      ];
      if (activeChatPaths.includes(window.location.pathname)) return;

      showMessageNotification(message);
    };

    syncSocketUser();
    window.addEventListener("authChanged", syncSocketUser);
    window.addEventListener("storage", syncSocketUser);
    window.addEventListener("click", askForNotifications, { once: true });
    window.addEventListener("touchstart", askForNotifications, { once: true });
    socket.on("receive_message", handleReceiveMessage);
    const heartbeatId = window.setInterval(() => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (userId && token) socket.emit("heartbeat", userId);
    }, 45000);

    return () => {
      window.removeEventListener("authChanged", syncSocketUser);
      window.removeEventListener("storage", syncSocketUser);
      window.removeEventListener("click", askForNotifications);
      window.removeEventListener("touchstart", askForNotifications);
      socket.off("receive_message", handleReceiveMessage);
      window.clearInterval(heartbeatId);
    };
  }, []);

  return null;
};

export default GlobalMessageNotifications;
