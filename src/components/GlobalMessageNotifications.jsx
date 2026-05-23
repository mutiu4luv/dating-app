import { useEffect } from "react";
import io from "socket.io-client";
import {
  getIdValue,
  requestNotificationPermission,
  showMessageNotification,
} from "../utility/notifications";
import api from "./api/Api";

const socket = io(
  import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_BASE_URL ||
    "http://localhost:7000",
  { transports: ["websocket"] }
);

const GlobalMessageNotifications = () => {
  useEffect(() => {
    let latestUnreadCheckTimer;

    const syncSocketUser = () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) return;

      socket.emit("register_user", userId);
      socket.emit("join_room", userId);
    };

    const rememberNotifiedMessage = (messageId) => {
      if (messageId) localStorage.setItem("lastNotifiedMessageId", messageId);
    };

    const alreadyNotified = (messageId) =>
      messageId && localStorage.getItem("lastNotifiedMessageId") === messageId;

    const checkLatestUnreadMessage = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (!userId || !token || navigator.onLine === false) return;

      window.clearTimeout(latestUnreadCheckTimer);
      latestUnreadCheckTimer = window.setTimeout(async () => {
        try {
          const res = await api.get(`/chat/unread/latest/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const message = res.data?.data;
          if (!message?._id || alreadyNotified(message._id)) return;

          const activeChatPaths = [
            `/chat/${getIdValue(message.receiverId)}/${getIdValue(
              message.senderId
            )}`,
            `/chat/${getIdValue(message.senderId)}/${getIdValue(
              message.receiverId
            )}`,
          ];
          if (activeChatPaths.includes(window.location.pathname)) return;

          rememberNotifiedMessage(message._id);
          showMessageNotification(message);
        } catch (err) {
          console.error("Latest unread notification check failed:", err);
        }
      }, 350);
    };

    const askForNotifications = () => {
      requestNotificationPermission();
    };

    const handleReceiveMessage = (message) => {
      const userId = localStorage.getItem("userId");
      const receiverId = getIdValue(message.receiverId);
      const senderId = getIdValue(message.senderId);
      if (!userId || receiverId !== userId) return;

      window.dispatchEvent(
        new CustomEvent("incomingMessage", {
          detail: { ...message, senderId, receiverId },
        })
      );
      const activeChatPaths = [
        `/chat/${receiverId}/${senderId}`,
        `/chat/${senderId}/${receiverId}`,
      ];
      if (activeChatPaths.includes(window.location.pathname)) return;

      rememberNotifiedMessage(message._id);
      showMessageNotification(message);
    };

    const handleActiveConnection = () => {
      syncSocketUser();
      checkLatestUnreadMessage();
    };

    const handleVisibilityChange = () => {
      syncSocketUser();
      if (!document.hidden) checkLatestUnreadMessage();
    };

    syncSocketUser();
    checkLatestUnreadMessage();
    window.addEventListener("authChanged", syncSocketUser);
    window.addEventListener("storage", syncSocketUser);
    window.addEventListener("focus", handleActiveConnection);
    window.addEventListener("online", handleActiveConnection);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("click", askForNotifications, { once: true });
    window.addEventListener("touchstart", askForNotifications, { once: true });
    socket.on("connect", syncSocketUser);
    socket.io.on("reconnect", handleActiveConnection);
    socket.on("receive_message", handleReceiveMessage);

    const sendHeartbeat = () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (userId && token && navigator.onLine !== false) {
        socket.emit("heartbeat", userId);
      }
    };

    sendHeartbeat();
    const heartbeatId = window.setInterval(sendHeartbeat, 20000);

    return () => {
      window.removeEventListener("authChanged", syncSocketUser);
      window.removeEventListener("storage", syncSocketUser);
      window.removeEventListener("focus", handleActiveConnection);
      window.removeEventListener("online", handleActiveConnection);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("click", askForNotifications);
      window.removeEventListener("touchstart", askForNotifications);
      socket.off("connect", syncSocketUser);
      socket.io.off("reconnect", handleActiveConnection);
      socket.off("receive_message", handleReceiveMessage);
      window.clearInterval(heartbeatId);
      window.clearTimeout(latestUnreadCheckTimer);
    };
  }, []);

  return null;
};

export default GlobalMessageNotifications;
