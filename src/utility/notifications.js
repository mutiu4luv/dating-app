export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};

export const showMessageNotification = (message) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const body =
    message.content || (message.imageUrl ? "Sent you a photo" : "New message");

  new Notification("New message", {
    body,
    tag: `message-${message.senderId}`,
  });
};
