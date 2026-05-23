export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};

export const getIdValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || "";
  return String(value);
};

export const showMessageNotification = async (message) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const senderId = getIdValue(message.senderId);
  const receiverId = getIdValue(message.receiverId);
  const senderName =
    message.senderName ||
    message.senderId?.name ||
    message.senderId?.username ||
    "Someone";
  const body =
    message.content || (message.imageUrl ? "Sent you a photo" : "New message");

  const options = {
    body,
    tag: `message-${senderId}-${message._id || Date.now()}`,
    badge: "/vite.svg",
    icon: "/vite.svg",
    vibrate: [120, 60, 120],
    data: {
      ...message,
      senderId,
      receiverId,
    },
  };

  if ("serviceWorker" in navigator) {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 1200)),
    ]).catch(() => null);

    if (registration?.showNotification) {
      await registration.showNotification(`New message from ${senderName}`, {
        ...options,
        requireInteraction: true,
      });
      return;
    }
  }

  new Notification(`New message from ${senderName}`, options);
};
